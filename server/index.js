const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 4000;
const workbookDir = path.join(__dirname, 'data');
const workbookPath = path.join(workbookDir, 'contact-submissions.xlsx');
const worksheetName = 'Submissions';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve the static site (everything outside the server directory)
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

const ensureWorkbook = async () => {
  await fs.promises.mkdir(workbookDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(workbookPath)) {
    await workbook.xlsx.readFile(workbookPath);
    let worksheet = workbook.getWorksheet(worksheetName);
    if (!worksheet) {
      worksheet = workbook.addWorksheet(worksheetName);
    }
    if (!worksheet.getRow(1).hasValues()) {
      worksheet.columns = [
        { header: 'Submitted At', key: 'submittedAt', width: 22 },
        { header: 'Full Name', key: 'name', width: 28 },
        { header: 'Email', key: 'email', width: 32 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Programme', key: 'programme', width: 32 },
        { header: 'Message', key: 'message', width: 60 }
      ];
    }
    return workbook;
  }

  const worksheet = workbook.addWorksheet(worksheetName);
  worksheet.columns = [
    { header: 'Submitted At', key: 'submittedAt', width: 22 },
    { header: 'Full Name', key: 'name', width: 28 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Programme', key: 'programme', width: 32 },
    { header: 'Message', key: 'message', width: 60 }
  ];
  await workbook.xlsx.writeFile(workbookPath);
  return workbook;
};

const appendSubmission = async (payload) => {
  const workbook = await ensureWorkbook();
  let worksheet = workbook.getWorksheet(worksheetName);
  if (!worksheet) {
    worksheet = workbook.addWorksheet(worksheetName);
  }

  worksheet.addRow({
    submittedAt: new Date().toISOString(),
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    programme: payload.programme || '',
    message: payload.message || ''
  });

  worksheet.columns.forEach((column) => {
    let maxLength = column.header.length;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLength) {
        maxLength = Math.min(cellValue.length, 80);
      }
    });
    column.width = maxLength + 2;
  });

  await workbook.xlsx.writeFile(workbookPath);
};

app.post('/api/contact', async (req, res) => {
  const { name, email, message, programme, phone } = req.body || {};

  if (!name || !email || !message || !programme) {
    return res.status(422).json({
      success: false,
      error: 'Missing required fields. Please provide name, email, programme, and message.'
    });
  }

  try {
    await appendSubmission({ name, email, message, programme, phone });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error writing to workbook', error);
    res.status(500).json({
      success: false,
      error: 'Could not record your submission. Please try again later.'
    });
  }
});

// Fallback to index.html for unknown routes (keeps static navigation working)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AKEB Evershine backend running on http://localhost:${PORT}`);
});
