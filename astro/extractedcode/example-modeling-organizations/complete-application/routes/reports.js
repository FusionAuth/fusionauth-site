const express = require('express');
const router = express.Router();
const checkGrantPermissions = require('../middleware/checkGrantPermissions');
const fs = require('fs').promises;
const multer  = require('multer');
const upload = multer({ dest: 'data/reports' });

const reportData = require('../data/reports.json');

router.get('/', checkGrantPermissions(['Admin', 'Reports', 'Viewer']), function (req, res, next) {

    const companyName = req.session.selectedGrant.entity.name;
    const companyId = req.session.selectedGrant.entity.id;
    
    // you would load this from a database probably, and most likely with an ID instead of name. 
    const data = reportData[companyId];

    res.render('reports', {
        title: companyName + ' - Reports',
        data: data, 
        user: req.user.user,
        company: companyName,
        companyId: companyId,
        logoutURL: req.logoutURL,
        selectedGrant: req.session.selectedGrant
    });
});


router.post('/', checkGrantPermissions(['Admin', 'Reports']), upload.single('file_report') ,  async function (req, res, next) {

    const companyId = req.session.selectedGrant.entity.id;
    // rename the file to the original name + the unique identifier and put it in the correct company folder
    const folderPath = `data/reports/${companyId}/`;
    const uniqueName = `${req.file.filename}-${req.file.originalname}`;
    await fs.mkdir(folderPath, { recursive: true });
    await fs.rename(req.file.path, `${folderPath}${uniqueName}`);

    req.body.file_url = `/reports/files/${uniqueName}`;
    reportData[companyId].push(req.body);
    await fs.writeFile('data/reports.json', JSON.stringify(reportData, null, 2));
    res.redirect('/reports');
});


router.get('/files/:file', checkGrantPermissions(['Admin', 'Reports']), async function (req, res, next) {
    const companyId = req.session.selectedGrant.entity.id;
    const path = `data/reports/${companyId}/${req.params.file}`;
    // Check if the file exists: 
    try {
        await fs.access(path);
    } catch (err) {
        return res.status(404).send('File not found');
    }
    res.download(path);
}); 

module.exports = router;