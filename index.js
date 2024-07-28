const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, './data/tenders.db'), (err) => {
  if (err) {
    console.error('Database opening error: ', err);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS tenders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        noticeType TEXT,
        noticeContractType TEXT,
        tenderNumber TEXT,
        noticeLanguage TEXT,
        subjectLocal TEXT,
        subjectEnglish TEXT,
        quantity TEXT,
        tenderDescription TEXT,
        noticeText TEXT,
        noticeUrl TEXT,
        eligibilityOfBidders TEXT,
        procurementMethod TEXT,
        issueDate TEXT,
        openingDate TEXT,
        closingDate TEXT,
        currency TEXT,
        estimatedAmount TEXT,
        contractDuration TEXT,
        buyerID TEXT,
        buyerName TEXT,
        contactName TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        state TEXT,
        phone TEXT,
        fax TEXT,
        email TEXT,
        url TEXT,
        performanceCountry TEXT,
        performanceState TEXT,
        awardDate TEXT,
        awardCompanyName TEXT,
        awardCompanyAddress TEXT,
        awardCountry TEXT,
        awardState TEXT,
        contractDurationAward TEXT,
        initialEstimatedValue TEXT,
        currencyAward TEXT,
        finalValue TEXT,
        sourceOfFunds TEXT,
        fundingAgency TEXT,
        projectName TEXT,
        cpvCodes TEXT,
        originalLinkOrDataId TEXT,
        docsUpload TEXT
      )
    `);
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}`);
  }
});

const upload = multer({ storage: storage });

// Handle form submission
app.post('/submit', upload.single('docsUpload'), (req, res) => {
  const {
    noticeType, noticeContractType, tenderNumber, noticeLanguage, subjectLocal,
    subjectEnglish, quantity, tenderDescription, noticeText, noticeUrl,
    eligibilityOfBidders, procurementMethod, issueDate, openingDate, closingDate,
    currency, estimatedAmount, contractDuration, buyerID, buyerName, contactName,
    address, city, country, state, phone, fax, email, url, performanceCountry,
    performanceState, awardDate, awardCompanyName, awardCompanyAddress, awardCountry,
    awardState, contractDurationAward, initialEstimatedValue, currencyAward, finalValue,
    sourceOfFunds, fundingAgency, projectName, cpvCodes, originalLinkOrDataId
  } = req.body;

  const docsUpload = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO tenders (
      noticeType, noticeContractType, tenderNumber, noticeLanguage, subjectLocal,
      subjectEnglish, quantity, tenderDescription, noticeText, noticeUrl,
      eligibilityOfBidders, procurementMethod, issueDate, openingDate, closingDate,
      currency, estimatedAmount, contractDuration, buyerID, buyerName, contactName,
      address, city, country, state, phone, fax, email, url, performanceCountry,
      performanceState, awardDate, awardCompanyName, awardCompanyAddress, awardCountry,
      awardState, contractDurationAward, initialEstimatedValue, currencyAward, finalValue,
      sourceOfFunds, fundingAgency, projectName, cpvCodes, originalLinkOrDataId, docsUpload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    noticeType, noticeContractType, tenderNumber, noticeLanguage, subjectLocal,
    subjectEnglish, quantity, tenderDescription, noticeText, noticeUrl,
    eligibilityOfBidders, procurementMethod, issueDate, openingDate, closingDate,
    currency, estimatedAmount, contractDuration, buyerID, buyerName, contactName,
    address, city, country, state, phone, fax, email, url, performanceCountry,
    performanceState, awardDate, awardCompanyName, awardCompanyAddress, awardCountry,
    awardState, contractDurationAward, initialEstimatedValue, currencyAward, finalValue,
    sourceOfFunds, fundingAgency, projectName, cpvCodes, originalLinkOrDataId, docsUpload
  ];

  // check for duplicates then insert
  // Function to check for duplicate records
  function checkForDuplicates(tableName, columns, values, callback) {
    let whereClause = columns.map(column => `${column} = ?`).join(' AND ');
    let sql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${whereClause}`;
    
    db.get(sql, values, (err, row) => {
      console.log(row.count)
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, row.count > 0);
    });
  }

  // Example usage
  let tableName = 'tenders';
  let columns = ['noticeType', 'noticeContractType', 'tenderNumber', 'noticeLanguage', 'subjectLocal',
    'subjectEnglish', 'quantity', 'tenderDescription'];

  let values1 = [noticeType, noticeContractType, tenderNumber, noticeLanguage, subjectLocal,
    subjectEnglish, quantity, tenderDescription];

  checkForDuplicates(tableName, columns, values1, (err, isDuplicate) => {
    if (err) {
        console.error('Error checking for duplicates:', err);
    } else if (isDuplicate) {
        console.log('Duplicate record found.');
        res.json({ success: false, message: 'Duplicates data found!!' });
    } else {
        console.log('No duplicate record found.');
        db.run(sql, values, function (err) {
          if (err) {
            console.error(err.message);
            res.json({ success: false, message: 'Error occurred while inserting data.' });
          } else {
            res.json({ success: true, message: 'Data inserted successfully!', id: this.lastID });
          }
        });
    }
  });


  

});

// Handle data download as JSON
app.get('/download', (req, res) => {
  const sql = 'SELECT * FROM tenders';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: 'Error occurred while fetching data.' });
    } else {
      res.json(rows);
    }
  });
});

// Serve the form HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
