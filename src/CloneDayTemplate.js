// Debugging aids 2020-09-08v1
const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2;
(debuglvl = 3), (tracelvl = 4), (msglvl = warnlvl);
function errorMsg(tag, msg) {
    if (msglvl >= errorlvl) msgMsg('ERROR: ', tag, msg);
}
function warnMsg(tag, msg) {
    if (msglvl >= errorlvl) msgMsg('WARNING: ', tag, msg);
}
function infoMsg(tag, msg) {
    if (msglvl >= infolvl) msgMsg('INFO: ', tag, msg);
}
function traceMsg(tag, msg) {
    if (msglvl >= tracelvl) msgMsg('TRACE: ', tag, msg);
}
function debugMsg(tag, msg) {
    if (msglvl >= debuglvl) msgMsg('DEBUG: ', tag, msg);
}
function inspect(parm) {
    if (Array.isArray(parm)) {
        if (parm.length > 0) {
            return 'Array of ' + inspect(parm[0]);
        } else {
            return 'Empty array';
        }
    } else {
        if (typeof parm === 'object') {
            return 'Object of type ' + parm.constructor.name;
        } else {
            return 'Type of ' + typeof parm;
        }
    }
}
function msgMsg(label, p2, p3) {
    if (p3 === undefined) {
        if (typeof p2 === 'string') {
            console.debug(label + p2);
            return;
        } else {
            console.debug(label + ' (' + inspect(p2) + ')', p2);
            return;
        }
    }
    if (p2 !== undefined) {
        console.debug(label + p2 + ' (' + inspect(p3) + ')', p3);
        return;
    }
    console.debug(label + ' No parameters passed');
}

// Clone a Day Template record set 2020-11-09v2

output.markdown('# Clone a Day Template and all its details.');

// Retrieve tables/records

let dayTemplates = await base.getTable('Day Templates').getView('Export').selectRecordsAsync();
traceMsg('dayTemplates: ', dayTemplates);

let dayTemplateDetails = await base.getTable('Day Template Details').getView('Export').selectRecordsAsync();
traceMsg('Day Template Details: ', dayTemplateDetails);

infoMsg('Cloning Underway');
let sourceTemplateRecord = await input.recordAsync("Choose the Day Template you'd like to clone ", base.getTable('Day Templates'));
output.markdown('## Will clone "' + sourceTemplateRecord.getCellValueAsString('Day Template') + '"');
//output.markdown('## Will clone ${sourceTemplateRecord.getCellValueAsString("Day Template")}');

let sourceTemplateName = sourceTemplateRecord.getCellValueAsString('Day Template Details');

let newTempateName = await input.textAsync('What should be the name of the new template?');
output.text(`Cloning to new template with name "${newTempateName}".`);

// Create new parent record
let newTemplateRecord = await base.getTable('Day Templates').createRecordAsync({
    'Day Template': newTempateName,
    Day: sourceTemplateRecord.getCellValue('Day'),
    Notes: sourceTemplateRecord.getCellValue('Notes'),
});

// Accumulate child record field values
traceMsg('new template record ', newTemplateRecord);
traceMsg('sourceTemplateRecord.id', sourceTemplateRecord.id);
let clonedRecords = [];
for (let templateDetailsRecord of dayTemplateDetails.records) {
    traceMsg('record', templateDetailsRecord);
    traceMsg('Name ', templateDetailsRecord.getCellValue('Day Template'));
    let templateDetailsdayTemplateLink = templateDetailsRecord.getCellValue('Day Template')[0].id;
    traceMsg('templateDetailsdayTemplateLink ', templateDetailsdayTemplateLink);
    if (sourceTemplateRecord.id === templateDetailsdayTemplateLink) {
        debugMsg('hit');
        clonedRecords.push({
            fields: {
                'Day Template': [{id: newTemplateRecord}],
                'Program Name': templateDetailsRecord.getCellValue('Program Name'),
                'Program Start': templateDetailsRecord.getCellValue('Program Start'),
                Notes: templateDetailsRecord.getCellValue('Notes'),
                'Program Template': templateDetailsRecord.getCellValue('Program Template'),
                'Add/Overide 1': templateDetailsRecord.getCellValue('Add/Overide 1'),
                'Add/Overide 2': templateDetailsRecord.getCellValue('Add/Overide 2'),
                'Add/Overide 3': templateDetailsRecord.getCellValue('Add/Overide 3'),
            },
        });
    }
}
traceMsg('clonedRecords', clonedRecords);

// Create the new records
while (clonedRecords.length > 0) {
    await base.getTable('Day Template Details').createRecordsAsync(clonedRecords.slice(0, 50));
    clonedRecords = clonedRecords.slice(50);
}

output.markdown('# Cloning complete.');
export { };

