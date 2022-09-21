// Debugging aids 2020-09-08v1
const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2;
(debuglvl = 3), (tracelvl = 4), (msglvl = infolvl);
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

// Clone a Program Template record set 2020-11-06v2

// Retrieve tables/records

let programTemplates = await base
    .getTable('Program Template')
    .getView('Edit')
    .selectRecordsAsync();
traceMsg('programTemplates: ', programTemplates);

let programTemplateDetails = await base
    .getTable('Program Template Details')
    .getView('Export')
    .selectRecordsAsync();
traceMsg('Program Template Details: ', programTemplateDetails);

infoMsg('Cloning Underway');
let sourceTemplateRecord = await input.recordAsync(
    "Choose the program template you'd like to clone ",
    base.getTable('Program Template')
);
let sourceTemplateName =
    sourceTemplateRecord.getCellValueAsString('Program Template');
output.text(
    `Will clone Program template ${sourceTemplateRecord.getCellValueAsString(
        'Program Template'
    )}.`
);

let newTempateName = await input.textAsync(
    'What should be the name of the new template?'
);
output.text(`Cloning to new template with name "${newTempateName}".`);

// Create new parent record
let newTemplateRecord = await base
    .getTable('Program Template')
    .createRecordAsync({
        'Program Template': newTempateName,
        'Program Duration':
            sourceTemplateRecord.getCellValue('Program Duration'),
        Notes: sourceTemplateRecord.getCellValue('Notes'),
    });

// Accumulate child record field values
traceMsg('new template record ', newTemplateRecord);
traceMsg('sourceTemplateRecord.id', sourceTemplateRecord.id);
let clonedRecords = [];
for (let templateDetailsRecord of programTemplateDetails.records) {
    traceMsg('record', templateDetailsRecord);
    traceMsg('Name ', templateDetailsRecord.getCellValue('Log Entry'));
    let templateDetailsProgramTemplateLink =
        templateDetailsRecord.getCellValue('Program Template')[0].id;
    traceMsg(
        'templateDetailsProgramTemplateLink ',
        templateDetailsProgramTemplateLink
    );
    if (sourceTemplateRecord.id === templateDetailsProgramTemplateLink) {
        debugMsg('hit');
        clonedRecords.push({
            fields: {
                'Program Template': [{ id: newTemplateRecord }],
                'Break Name': templateDetailsRecord.getCellValue('Break Name'),
                'Break Start':
                    templateDetailsRecord.getCellValue('Break Start'),
                Sequence: templateDetailsRecord.getCellValue('Sequence'),
                'Included Types':
                    templateDetailsRecord.getCellValue('Included Types'),
                'Max Duration':
                    templateDetailsRecord.getCellValue('Max Duration'),
                Optional: templateDetailsRecord.getCellValue('Max Optional'),
            },
        });
    }
}
traceMsg('clonedRecords', clonedRecords);

// Create the new program log table
while (clonedRecords.length > 0) {
    await base
        .getTable('Program Template Details')
        .createRecordsAsync(clonedRecords.slice(0, 50));
    clonedRecords = clonedRecords.slice(50);
}

infoMsg('Cloning complete.');
