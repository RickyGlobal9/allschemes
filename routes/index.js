var express = require('express');
const app = express.Router();
var mysql = require('mysql');
const multer = require('multer');
var sh = require('short-hash');
const fs = require('fs')
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

const con = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files/');
  },

  filename: function (req, file, cb) {
    var datetimestamp = Date.now();

    // cb(null, datetimestamp + '_' + file.originalname)
    cb(null, 'f' + datetimestamp + 'e.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
});
var upload = multer({ storage: storage })

//upload single
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.send(req.file.filename);
  } catch (err) {
    res.send(400);
  }
});

var title = "All Jharkhand Schemes"

app.get('/', function (req, res, next) {
  res.render('index', { title: title });
});

app.get('/schemes', function (req, res, next) {
  res.render('schemes', { title: title });
});
app.get('/getschemes', function (req, res, next) {
  con.getConnection(function (err, con) {
    con.query(`SELECT * FROM scheme_category ORDER BY creation DESC`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('getschemes a: ' + err.message)
        }

        res.json(result)
      }
      catch (err) {
        console.log('getschemes b: ' + err.message)
      }
    });
  });
});

app.get('/search', function (req, res, next) {
  res.render('search', { title: title });
});
app.get('/getfiltereddepartments', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`SELECT * FROM scheme_category WHERE department = ${con.escape(req.query.department)} ORDER BY creation DESC`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('department a: ' + err.message)
        }

        res.json(result)
        console.log('department')
      }
      catch (err) {
        console.log('department b: ' + err.message)
      }
    });
  });
})
app.get('/getfilteredschemes', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`SELECT * FROM scheme_category WHERE scheme = ${con.escape(req.query.scheme)} ORDER BY creation DESC`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('department a: ' + err.message)
        }

        res.json(result)
        console.log('scheme')
      }
      catch (err) {
        console.log('department b: ' + err.message)
      }
    });
  });
})

app.get('/apply', (req, res) => {
  var tracking = sh(req.query.track).toUpperCase();

  con.getConnection(function (err, con) {
    con.query(`INSERT INTO scheme_apply VALUES(
        0,
      ${con.escape(req.query.department)},
      ${con.escape(req.query.scheme)},
      ${con.escape(req.query.name)},
      ${con.escape(req.query.mobile)},
      ${con.escape(req.query.aadhar)},
      ${con.escape(req.query.address)},
      ${con.escape(req.query.doc1)},
      ${con.escape(req.query.doc2)},
      ${con.escape(req.query.doc3)},
      ${con.escape(req.query.doc4)},
      ${con.escape(tracking)},
      'Pending',UNIX_TIMESTAMP())`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('apply a: ' + err.message)
        }
        res.json(tracking)
        console.log(tracking)
      }
      catch (err) {
        console.log('apply b: ' + err.message)
      }
    });
  });
})

//dashboard
app.get('/dashboard', function (req, res, next) {
  res.render('dashboard', { title: title });
});

app.get('/categories', function (req, res, next) {
  res.render('categories', { title: title });
});
app.get('/getcategories', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`SELECT * FROM scheme_category ORDER BY creation DESC`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('addcategory a: ' + err.message)
        }

        res.json(result)
      }
      catch (err) {
        console.log('addcategory b: ' + err.message)
      }
    });
  });
})
app.get('/addcategory', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`INSERT INTO scheme_category VALUES(0,
    ${con.escape(req.query.category)},
    ${con.escape(req.query.scheme)},
    ${con.escape(req.query.department)},
    ${con.escape(req.query.logo)},
    UNIX_TIMESTAMP())`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('addcategory a: ' + err.message)
        }

        res.json('Added successfully.')
      }
      catch (err) {
        console.log('addcategory b: ' + err.message)
      }
    });
  });
})
app.get('/removecategory', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`DELETE FROM scheme_category WHERE slno=${con.escape(req.query.slno)}`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('removecategory a: ' + err.message)
        }
        res.json('Category removed successfully.')
      }
      catch (err) {
        console.log('removecategory b: ' + err.message)
      }
    });
  });
})

//applications
app.get('/applications', function (req, res, next) {
  res.render('applications', { title: title });
});
app.get('/getapplications', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`SELECT * FROM scheme_apply ORDER BY creation DESC`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('getapplications a: ' + err.message)
        }

        res.json(result)
      }
      catch (err) {
        console.log('getapplications b: ' + err.message)
      }
    });
  });
})
app.get('/changeapplicationstatus', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`UPDATE scheme_apply SET status=${con.escape(req.query.status)} WHERE slno=${con.escape(req.query.slno)}`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('changeapplicationstatus a: ' + err.message)
        }
        res.json('Status changed successfully.')
      }
      catch (err) {
        console.log('changeapplicationstatus b: ' + err.message)
      }
    });
  });
})
app.get('/removeapplication', (req, res) => {
  con.getConnection(function (err, con) {
    con.query(`DELETE FROM scheme_apply WHERE slno=${con.escape(req.query.slno)}`, function (err, result) {
      try {
        con.release();
        if (err) {
          console.log('removeapplication a: ' + err.message)
        }
        res.json('Application removed successfully.')
      }
      catch (err) {
        console.log('removeapplication b: ' + err.message)
      }
    });
  });
})



// con.getConnection(function (err, con) {
//   con.query(`delete from scheme_apply`, function (err, result) {
//     if (err) {
//       console.error(err.stack);
//       return;
//     }
//     console.log(result)
//   });
// });


function mysql() {
  //create db
  con.query(`create database allschemes`,
    function (err, result) {
      if (err) {
        console.error(err.stack);
        return;
      }
      console.log(result)
    });

  //create table
  con.query(`CREATE TABLE scheme_category (
    slno INT AUTO_INCREMENT PRIMARY KEY,
    category NVARCHAR(225),    
    scheme NVARCHAR(225), 
    department NVARCHAR(225),  
    logo VARCHAR(50),
    creation NVARCHAR(225)
  )`,
    function (err, result) {
      if (err) {
        console.error(err.stack);
        return;
      }
      console.log(result)
    });

  //create table
  con.query(`CREATE TABLE scheme_apply (
    slno INT AUTO_INCREMENT PRIMARY KEY,
    department NVARCHAR(225), 
    scheme NVARCHAR(225),    
    name NVARCHAR(225), 
    mobile VARCHAR(15),  
    aadhar VARCHAR(50), 
    address NVARCHAR(225), 
    file1 VARCHAR(50), 
    file2 VARCHAR(50), 
    file3 VARCHAR(50), 
    file4 VARCHAR(50), 
    trackingid VARCHAR(50), 
    status VARCHAR(50), 
    creation VARCHAR(50)
  )`, function (err, result) {
    if (err) {
      console.error(err.stack);
      return;
    }
    console.log(result)
  }); con.getConnection(function (err, con) {

  });
}

module.exports = app;
