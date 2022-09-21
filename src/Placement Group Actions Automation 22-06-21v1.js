// Interface Actions Template 
/*jshint esversion: 6 */

const scriptName = "Placement Group Actions Automation";
const scriptVersion = "22-06-21 v1";

/*
    Interface Template Configuration - change these fields to to configure for your table/base.
*/
const cloneInThisTable = "Placement Groups";  // The name of the table where you want to be able to clone records.
const cloneUsingThisViewName = "Actions View"; // The view you want this script to use when reading records in the cloneInThisTable table.        
const cloneActionsFieldName = "Actions"; 
const cloneNameField = "Placement Groups";
   // The field name of the single select field that the user updates to invoke an action.
const cloneString = "Clone";    // String to check for if user wants to clone a record.
const deleteString = "Delete";  // String to check for if user wants to delete a record.
const consoleDebug = true;      // If true the code will generate console.debug messages to aid in troubleshooting.

const cloneTheseFields = [     // List the field names you want copied during a clone action.
    'Placement Group',
    'Placement Order',
    'Effective Date',
    'Expiration Date',
    'Days to Place',
    'Minimum Placement Interval',
    'Start Including',
    'Stop Including',
    'Start Excluding',
    'Stop Excluding',
    'Maximum Placements',
    'Program Name Match',
    'Program Template Match'];


/*
    Interface Template Code - leave as is.
*/

// debugMsg - a conditional wrapper for console.debug messages as a debugging aid.

function debugMsg(a, b = null) {
    if (consoleDebug) {
        if (b==null) {
            console.debug (a);
        } else {
            console.debug (a, b);
        }
    }
  }

// prepFieldsObject() populates the fields object to be used in the Airtble create record call  

function prepFieldsObject(recordToClone, theCloneFields) {
    let fieldsObject = {};
    let returnObject = {};
    debugMsg('returnObject:', returnObject);
    
    for (let aField of theCloneFields) {
        fieldsObject[aField] = recordToClone.getCellValue(aField) ;
//        returnObject.fields = recordToClone.getCellValue(aField) ;
        //fieldsObject.push(updateObject);
    }
    return returnObject.fields = Object.assign(fieldsObject);
}


debugMsg('Debugging scrip' + scriptName + ' version ' + scriptVersion);

// We expect only one record will be in the view at one time but Murphy's Law says it's not guaranteed.
let actionRecords = await base.getTable(cloneInThisTable).getView(cloneUsingThisViewName).selectRecordsAsync();
debugMsg('clone Records: ', actionRecords);

let  = [];
for (let aRecord of actionRecords.records) {
    debugMsg('cloneRecord: ', aRecord);
    let anAction = aRecord.getCellValue(cloneActionsFieldName).name;
    debugMsg('anAction: ', anAction);
    let myFields = {"Actions": null};

    // Reset the action value in the single select first so errors in the create don't cause an infinite loop.
    await base.getTable(cloneInThisTable).updateRecordAsync(aRecord,{[cloneActionsFieldName]: null});

    if (anAction == cloneString) {
        debugMsg('Cloning the record');
        fieldsObject = prepFieldsObject (aRecord, cloneTheseFields);
        debugMsg('fieldsObject:', fieldsObject);
        await base.getTable(cloneInThisTable).createRecordAsync(fieldsObject);
        debugMsg('done!');
    } else {
        if (anAction == deleteString) {

        debugMsg('Deleting the record');
        await base.getTable(cloneInThisTable).deleteRecordAsync(aRecord.id);
        } else {
            debugMsg('Ignoring the action - it was neither delete or clone');
        }
    }
}
