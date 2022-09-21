// Some debugging aids...
const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2;
const debuglvl = 3,
    tracelvl = 4,
    msglvl = 2;
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
