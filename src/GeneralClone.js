// Debugging aids 2020-09-08v1
const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2;
(debuglvl = 3), (tracelvl = 4), (msglvl = tracelvl);
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

// Generalized Clone 2020-11-05v1

const childrenField = 'Day Template Details';

const nameField = 'Day Templates';

const cloneTable = base.getTable(cursor.activeTableId);
traceMsg('Clone table', cloneTable);

const sourceParentRecord = await input.recordAsync("Choose the record you'd like to clone ", cloneTable);
traceMsg('sourceParentRecord', sourceParentRecord);

const targetRecordName = await input.textAsync('What should be the name of the new cloned record?');
output.text(`Cloning to new record with name "${targetRecordName}".`);

// Create new parent record
const cloneTableFields = await cloneTable.fields;
debugMsg('cloneTableFields: ', cloneTableFields);

let targetRecordValues = '';
for (let aField of cloneTableFields) {
    debugMsg('Field Name: ' + aField.name);
    debugMsg('Field Type: ' + aField.type);
    debugMsg('Computed Field: ' + aField.isComputed);
    debugMsg('childrenField ', childrenField);
    debugMsg('aField.isComputed ', aField.isComputed);
    if (!aField.isComputed && aField.name !== childrenField) {
        targetRecordValues = targetRecordValues + ' "' + aField.name + '" :' + sourceParentRecord.getCellValue(aField) + ',';
    }
    if (aField.name === nameField) {
        targetRecordValues = targetRecordValues + ' "' + aField.name + '" :' + targetRecordName + ',';
    }
}
traceMsg('targetRecordValues', targetRecordValues);

return;
let dayTemplates = await base.getTable('Day Templates').getView('Export').selectRecordsAsync();
traceMsg('dayTemplates: ', dayTemplates);

let dayTemplateDetails = await base.getTable('Day Template Details').getView('Export').selectRecordsAsync();
traceMsg('Day Template Details: ', dayTemplateDetails);

infoMsg('Cloning Underway');
let sourceTemplateRecord = await input.recordAsync("Choose the Day Template you'd like to clone ", base.getTable('Day Templates'));
let sourceTemplateName = sourceTemplateRecord.getCellValueAsString('Day Template Details');
output.text(`Will clone Day Templates ${sourceTemplateName}.`);

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

infoMsg('Cloning complete.');
