// Debugging aids 2020-09-17v3 -- add try/catch blocks
// 'use strict';
const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2,
    debuglvl = 3,
    tracelvl = 4;
let msglvl = warnlvl;
function errorMsg(tag, msg) {
    if (msglvl >= errorlvl) msgMsg('ERROR: ', tag, msg);
}
function warnMsg(tag, msg) {
    if (msglvl >= warnMsg) msgMsg('WARNING: ', tag, msg);
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
    try {
        if (Array.isArray(parm)) {
            if (parm.length > 0) {
                return 'Array of ' + inspect(parm[0]);
            } else {
                return 'Empty array';
            }
        } else {
            if (parm === null) {
                return 'null';
            }
            if (typeof parm === 'object') {
                return 'Object of type ' + parm.constructor.name;
            } else {
                return 'Type of ' + typeof parm;
            }
        }
    } catch (err) {
        console.debug('Error while inspecting debug info: ' + err);
    }
}
function msgMsg(label, p2, p3) {
    try {
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
    } catch (err) {
        console.debug('Error in mdgMsg function: ' + err);
    }
}

/*   
    Generate Logs 2020-11-09 v3
*/

output.markdown('# Program Log Generator');

// Retrieve all the tables/records needed from Airtable to producte the log
let parametersRecord = await input.recordAsync('Parameters record to be used', base.getTable('Generate Log'));
traceMsg('parametersRecord: ', parametersRecord);

infoMsg('Generating program log for ' + parametersRecord.getCellValueAsString('Program Log Date'));

let dayTemplate = parametersRecord.getCellValueAsString('Day Template');
infoMsg('Generating program using Day Template ' + dayTemplate);

infoMsg('Purging old Program Log');
// Purge old Program Log
let logRecords = await base.getTable('Program Log').getView('OnAir Export').selectRecordsAsync();
let recIDs = [];
for (let record of logRecords.records) {
    recIDs.push(record.id);
}
while (recIDs.length > 0) {
    traceMsg(recIDs);
    await base.getTable('Program Log').deleteRecordsAsync(recIDs.slice(0, 50));
    recIDs = recIDs.slice(50);
}

let createCount = 0;

let dayTemplates = await base.getTable('Day Templates').selectRecordsAsync();
traceMsg('Active Template: ', dayTemplates);

let dayTemplateDetails = await base.getTable('Day Template Details').getView('Export').selectRecordsAsync();
traceMsg('Day Template Details: ', dayTemplateDetails);

let programTemplateDetails = await base.getTable('Program Template Details').getView('Export').selectRecordsAsync();
traceMsg('Program Template Details: ', programTemplateDetails);

const pgmTemplateFields = ['Program Template', 'Add/Overide 1', 'Add/Overide 2', 'Add/Overide 3'];

let newLogRecords = [];
// Loop thru the day template details
for (let dayTemplateDetailsRecord of dayTemplateDetails.records) {
    traceMsg('1 dayTemplateDetailsRecord', dayTemplateDetailsRecord);
    traceMsg('2 dayTemplateDetailsRecord.getCellValueAsString(Day Template)', dayTemplateDetailsRecord.getCellValueAsString('Day Template'));
    if (dayTemplate === dayTemplateDetailsRecord.getCellValueAsString('Day Template')) {
        for (let aPgmTemplateFieldName of pgmTemplateFields) {
            programTemplateFromDayTemplateDetails = dayTemplateDetailsRecord.getCellValueAsString(aPgmTemplateFieldName);
            debugMsg('programTemplateFromDayTemplateDetails', programTemplateFromDayTemplateDetails);
            if (programTemplateFromDayTemplateDetails != null) {
                debugMsg('Adding log entries for program ' + dayTemplateDetailsRecord.getCellValue('Program Name'));
                traceMsg('dayTemplateDetailsRecord' + dayTemplateDetailsRecord);
                traceMsg('dayTemplateDetailsRecord INSP', dayTemplateDetailsRecord.getCellValue('Program Template'));

                // Now loop thru the program template details
                for (let programTemplateDetailsRecord of programTemplateDetails.records) {
                    programTemplateFromProgramTemplateDetails = programTemplateDetailsRecord.getCellValueAsString('Program Template');
                    if (programTemplateFromProgramTemplateDetails === programTemplateFromDayTemplateDetails) {
                        traceMsg('programTemplateFromDayTemplateDetails: ' + programTemplateFromDayTemplateDetails);
                        traceMsg("programTemplateDetailsRecord.getCellValue('Program Template Duration'),", programTemplateDetailsRecord.getCellValue('Program Template Duration'));
                        newLogRecords.push({
                            fields: {
                                'Log Title': parametersRecord.getCellValue('Log Title'),
                                'Station': parametersRecord.getCellValue('Station'),
                                'Program Log Date': parametersRecord.getCellValue('Program Log Date'),
                                DOW: parametersRecord.getCellValue('Day of Week'),
                                'Program Name': dayTemplateDetailsRecord.getCellValue('Program Name'),
                                'Program Start': dayTemplateDetailsRecord.getCellValue('Program Start'),
                                'Program Template Duration': programTemplateDetailsRecord.getCellValue('Program Template Duration'),
                                'Break Name': programTemplateDetailsRecord.getCellValue('Break Name'),
                                'Max Duration': programTemplateDetailsRecord.getCellValue('Max Duration'),
                                Sequence: programTemplateDetailsRecord.getCellValue('Sequence'),
                                'Break Start': programTemplateDetailsRecord.getCellValue('Break Start'),
                                'Included Types': programTemplateDetailsRecord.getCellValue('Included Types String'),
                                'Program Template': programTemplateDetailsRecord.getCellValueAsString('Program Template'),
                                'Day Template': dayTemplate,
                                'Content Placement Status': 'Empty',
                                Content: '',
                                'Content Start': 0,
                                'Content Duration': 0,
                            },
                        });
                    } else {
                        traceMsg('Program Template no match for ', dayTemplateDetailsRecord.getCellValue('Program Template'));
                    }
                }
            }
        }
    }
}

debugMsg('newLogRecords', newLogRecords);

// Create the new program log table
while (newLogRecords.length > 0) {
    await base.getTable('Program Log').createRecordsAsync(newLogRecords.slice(0, 50));
    newLogRecords = newLogRecords.slice(50);
}
output.markdown('# Log Generation Complete');
