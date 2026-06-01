const express = require('express');
const router = express.Router();
const TPO = require('../models/TPO');
const Job = require('../models/Job');
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const LoginLog = require('../models/LoginLog');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check for TPO
    const tpo = await TPO.findOne({ email }).select('+password');
    if (!tpo) {
      // Log failed login attempt
      await LoginLog.create({
        userModel: 'TPO',
        action: 'failed_login',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if TPO is active
    if (tpo.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact the administrator.'
      });
    }

    // Check password
    const isMatch = await tpo.matchPassword(password);
    if (!isMatch) {
      // Log failed login attempt
      await LoginLog.create({
        userId: tpo._id,
        userModel: 'TPO',
        action: 'failed_login',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = tpo.getSignedJwtToken();

    // Log successful login
    await LoginLog.create({
      userId: tpo._id,
      userModel: 'TPO',
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update last active timestamp
    tpo.lastActive = Date.now();
    await tpo.save();

    // Send response
    res.status(200).json({
      success: true,
      token,
      role: 'tpo',
      data: {
        id: tpo._id,
        name: tpo.name,
        email: tpo.email,
        department: tpo.department
      }
    });
  } catch (error) {
    console.error('TPO login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// Protected routes below this line
router.use(protect);

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, activeDrives, mockTests, placedStudents] = await Promise.all([
      Student.countDocuments(),
      Job.countDocuments({ createdBy: req.user.id, status: 'active' }),
      Exam.countDocuments({ createdBy: req.user.id }),
      Student.countDocuments({ placementStatus: 'placed' })
    ]);

    res.json({
      totalStudents,
      activeDrives,
      mockTests,
      placedStudents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Profile Management
router.get('/profile', async (req, res) => {
  try {
    const tpo = await TPO.findById(req.user.id);
    res.json(tpo);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const tpo = await TPO.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(tpo);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Job Drive Management
router.post('/jobs', protect, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.id })
      .populate({
        path: 'applications.student',
        select: 'name usn branch'
      });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/jobs/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    const jobs = await Job.find({
      createdBy: req.user.id,
      $or: [
        { companyName: { $regex: q, $options: 'i' } },
        { jobRole: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific job
router.get('/jobs/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    }).populate({
      path: 'applications.student',
      select: 'name usn branch'
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or you do not have access' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a job
router.put('/jobs/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or you do not have access' });
    }
    
    // Update job details
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or you do not have access' });
    }
    
    await job.remove();
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student Filtering
router.post('/students/filter', async (req, res) => {
    try {
        const { 
            search,
            department, 
            branch,
            semester,
            city,
            state, 
            minTenthPercentage,
            minTwelfthPercentage,
            minDegreePercentage,
            minCGPA,
            maxBacklogs,
            placementStatus
        } = req.body;

        let query = {};

        // Basic filters
        if (department) query.department = department;
        if (branch) query.branch = branch;
        if (semester) query.semester = parseInt(semester);
        if (city) query.city = { $regex: city, $options: 'i' };
        if (state) query.state = { $regex: state, $options: 'i' };
        if (placementStatus) query.placementStatus = placementStatus;
        
        // Academic filters
        if (minTenthPercentage) {
            query.tenthPercentage = { $gte: parseFloat(minTenthPercentage) };
        }
        
        if (minTwelfthPercentage) {
            query.twelfthPercentage = { $gte: parseFloat(minTwelfthPercentage) };
        }
        
        if (minDegreePercentage) {
            query.degreePercentage = { $gte: parseFloat(minDegreePercentage) };
        }
        
        if (minCGPA) {
            query.cgpa = { $gte: parseFloat(minCGPA) };
        }
        
        // Backlog filter
        if (maxBacklogs !== undefined && maxBacklogs !== '') {
            query.backlogs = { $lte: parseInt(maxBacklogs) };
        }

        // Search filter (name, USN, email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { usn: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Student filter query:', JSON.stringify(query, null, 2));
        
        // Select all fields except password and resume file content
        const students = await Student.find(query)
            .select('-password -resume.file')
            .sort({ usn: 1 });

        res.json(students);
    } catch (error) {
        console.error('Error filtering students:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch students'
        });
    }
});

// Update the export function to include all relevant fields
router.get('/students/export', async (req, res) => {
    try {
        // Get filter parameters from query string
        const { 
            search,
            department, 
            branch,
            semester,
            city,
            state, 
            minTenthPercentage,
            minTwelfthPercentage,
            minDegreePercentage,
            minCGPA,
            maxBacklogs,
            placementStatus
        } = req.query;

        // Build query based on provided filters
        let query = {};

        // Basic filters
        if (department) query.department = department;
        if (branch) query.branch = branch;
        if (semester) query.semester = parseInt(semester);
        if (city) query.city = { $regex: city, $options: 'i' };
        if (state) query.state = { $regex: state, $options: 'i' };
        if (placementStatus) query.placementStatus = placementStatus;
        
        // Academic filters
        if (minTenthPercentage) {
            query.tenthPercentage = { $gte: parseFloat(minTenthPercentage) };
        }
        
        if (minTwelfthPercentage) {
            query.twelfthPercentage = { $gte: parseFloat(minTwelfthPercentage) };
        }
        
        if (minDegreePercentage) {
            query.degreePercentage = { $gte: parseFloat(minDegreePercentage) };
        }
        
        if (minCGPA) {
            query.cgpa = { $gte: parseFloat(minCGPA) };
        }
        
        // Backlog filter
        if (maxBacklogs !== undefined && maxBacklogs !== '') {
            query.backlogs = { $lte: parseInt(maxBacklogs) };
        }

        // Search filter (name, USN, email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { usn: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Student export query:', JSON.stringify(query, null, 2));
        
        const students = await Student.find(query).select('-password -resume');
        
        // Include all important fields in the CSV
        const fields = [
            'name', 'usn', 'email', 'phoneNumber', 
            'branch', 'department', 'semester', 
            'city', 'state',
            'tenthPercentage', 'twelfthPercentage', 'degreePercentage', 'cgpa', 
            'backlogs', 'placementStatus'
        ];
        
        const csv = students.map(student => 
            fields.map(field => {
                // Handle nested or undefined fields
                const value = student[field];
                // Ensure no commas break the CSV format
                return value !== undefined ? String(value).replace(/,/g, ';') : '';
            }).join(',')
        );
        
        csv.unshift(fields.join(','));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students_data.csv');
        res.status(200).send(csv.join('\n'));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mock Test Management
router.post('/exams', async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user.id })
      .populate({
        path: 'results.student',
        select: 'name usn'
      });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/exams/:examId/results', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)
      .populate({
        path: 'results.student',
        select: 'name usn'
      });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam.results);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/exams/:examId/results/export', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)
      .populate({
        path: 'results.student',
        select: 'name usn'
      });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const fields = ['studentName', 'usn', 'score'];
    const csv = exam.results.map(result => 
      [result.student.name, result.student.usn, result.score].join(',')
    );
    csv.unshift(fields.join(','));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=exam_results.csv');
    res.status(200).send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Placed Students Management
router.get('/placed-students', async (req, res) => {
  try {
    const students = await Student.find({ placementStatus: 'placed' })
      .populate('placements');
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/placed-students/export', async (req, res) => {
  try {
    const students = await Student.find({ placementStatus: 'placed' })
      .populate('placements');

    const fields = ['name', 'usn', 'company', 'package', 'joiningDate'];
    const csv = students.map(student => 
      student.placements.map(placement => 
        [student.name, student.usn, placement.company, placement.package, placement.joiningDate].join(',')
      )
    ).flat();
    csv.unshift(fields.join(','));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=placement_report.csv');
    res.status(200).send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/placed-students/:studentId', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { 
        $set: { placementStatus: 'placed' },
        $push: { placements: req.body }
      },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;