# AKEB Evershine Site

Static marketing site enhanced with a lightweight Node.js backend to capture contact form submissions in an Excel workbook.

## Frontend
- HTML pages live at the project root (index.html, contact.html, portfolio.html, etc.).
- Custom styles in assets/css/style.css and behaviour in assets/js/main.js.
- When the backend is running, the same Express server also serves these static assets.

## Backend
- Location: server/
- Stack: Express, ExcelJS, CORS.
- Endpoint: POST /api/contact accepts form submissions and appends them to server/data/contact-submissions.xlsx with timestamp, contact details, and message.

## Getting Started
1. Install dependencies:
	```bash
	cd server
	npm install
	```
2. Start the backend (serves the site at http://localhost:4000/ by default):
	```bash
	npm run dev   # reloads on file changes (requires nodemon)
	# or
	npm start
	```
3. Visit http://localhost:4000/contact.html and submit the form. New rows appear in server/data/contact-submissions.xlsx once a submission is accepted.

## Customising the Backend
- Change PORT via the PORT environment variable before starting the server.
- Update server/index.js if you want to forward submissions to email, databases, or other services in addition to Excel.
- The worksheet schema is defined where the workbook columns are set. Modify the column definitions if additional fields are needed.

## Notes
- Ensure Node.js 18+ is installed locally.
- The backend creates server/data/contact-submissions.xlsx automatically. Commit the file only if you intend to share sample data; otherwise add the data/ folder to .gitignore.
