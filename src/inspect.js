let errorlvl = 0,
    warnlvl = 1,
    infolvl = 2,
    debuglvl = 3,
    tracelvl = 4,
    msglvl = tracelvl;
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
            return 'Array of ' + typeof parm[0];
        } else {
            return 'Empty array';
        }
    } else {
        if (typeof parm === 'object') {
            return 'Object of type ' + parm.constructor.name;
        } else {
            return 'Type of' + typeof parm + ') ';
        }
    }
}
function msgMsg(label, p2, p3) {
    if (p3 === undefined) {
        if (typeof p2 === 'string') {
            console.debug('1' + label + p2);
            return;
        } else {
            console.debug('2' + label + ' (' + inspect(p2) + ')', p2);
            return;
        }
    }
    if (p2 !== undefined) {
        console.debug('3' + label + p2 + ' (' + inspect(p3) + ')', p3);
        return;
    }
    console.debug('4' + label + ' No parameters passed');
}

infoMsg('Placing Content in Program Log');
msglvl = tracelvl;

// Initialize state of log and contents
let lastProgram = '';
let lastBreak = '';
let lastEntryDuration = -1;
let lastLogEntryStart = -1;

// Get all the data we'll we working with
let playbackDevices = await base.getTable('Media Playback Devices').getView('Grid view').selectRecordsAsync();
traceMsg('playbackDevices', playbackDevices);
let contentTypes = await base.getTable('Content Types').getView('Grid view').selectRecordsAsync();
traceMsg('contentTypes', contentTypes);
let contentItems = await base.getTable('Content Items').getView('OnAir Export').selectRecordsAsync();
traceMsg('contentItems', contentItems);
let logEntries = await base.getTable('Program Log').getView('OnAir Export').selectRecordsAsync();
traceMsg('logEntries', logEntries);
let contentGroups = await base.getTable('Content Groups').getView('OnAir Export').selectRecordsAsync();
traceMsg(contentGroups);
