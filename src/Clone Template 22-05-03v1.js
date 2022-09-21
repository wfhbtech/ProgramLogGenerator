// Interface Actions Template 
/*jshint esversion: 6 */

const InterfaceActionsVersion = "22-05-03 v26";

// Replace this string with a summary of how your


/*
    Interface Template Configuration - change these fields to to configure for your table/base.
*/
const cloneInThisTable = "Program Template Details";  // The name of the table where you want to be able to clone records.
const cloneUsingThisViewName = "Actions View"; // The view you want this script to use when reading records in the cloneInThisTable table.        
const cloneActionsFieldName = "Actions";    // The field name of the single select field that the user updates to invoke an action.
const cloneString = "Clone";    // String to check for if user wants to clone a record.
const deleteString = "Delete";  // String to check for if user wants to delete a record.
const consoleDebug = true;      // If true the code will generate console.debug messages to aid in troubleshooting.

const cloneTheseFields = [     // List the field names you want copied during a clone action.
    'Program Template',
    'Break Name',
    'Break Start',
    'Sequence',
    'Comment',
    'Included Types'];


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


debugMsg('Debugging Interface Actions using ' + InterfaceActionsVersion);

// We expect only one record will be in the view at one time but Murphy's Law says it's not guaranteed.
let actionRecords = await base.getTable(cloneInThisTable).getView(cloneUsingThisViewName).selectRecordsAsync();
debugMsg('clone Records: ', actionRecords);

let  = [];
for (let aRecord of actionRecords.records) {
    debugMsg('cloneRecord: ', aRecord);
    let anAction = aRecord.getCellValue(cloneActionsFieldName).name;
    debugMsg('anAction: ', anAction);
    let myFields = {"Actions": null};

    // Reset the action value in the single select first so errors in the create logic don't cause an infinite loop.
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


////////////////////////////////////////////////////////////////////////////
//const cloneRecord = await input.recordAsync(inputPrompt, cloneInThisTable);
debugMsg('clone Record', prepFieldsObject);

function prepFieldsObject (recordToClone, theCloneFields, zreturnObject) {
    let fieldsObject = {};
    let returnObject = {};
    debugMsg('returnObject:', returnObject);
    
    for (let aField of theCloneFields) {
        fieldsObject[aField] = recordToClone.getCellValue(aField) ;
//        returnObject.fields = recordToClone.getCellValue(aField) ;
        //fieldsObject.push(updateObject);
    }
    debugMsg('fieldsObject:', fieldsObject);
    return returnObject.fields = Object.assign(fieldsObject);
}

const newRecords =[];
// Clone the Event Template
newRecords.push({
    fields: {
        cloneNameField: prepFieldsObject.getCellValue(cloneNameField)  + " copy",
        cloneFields0 : prepFieldsObject.getCellValue(cloneFields0),
        cloneFields1 : prepFieldsObject.getCellValue(cloneFields0),
        cloneFields2 : prepFieldsObject.getCellValue(cloneFields0),
        cloneFields3 : prepFieldsObject.getCellValue(cloneFields0),
        initFields0 : prepFieldsObject.getCellValue(cloneFields0),
    },
});
debugMsg('new Records:',newRecords);
const newEventRecord = await base.getTable(cloneTable).createRecordsAsync(newRecords);
debugMsg('newEventRecordID',newEventRecord);


// Clone the current Event Template Details line
let table = base.getTable('Event Template Details');
let controlPanelRecord = await input.recordAsync('Select a line to clone', table);
debugMsg('controlPanelRecord', controlPanelRecord);



let zmyobject = {};

let fieldsObj = {};
debugMsg('fieldsObj:',fieldsObj);


const myobject = prepFieldsObject(controlPanelRecord, cloneTheseFields, zmyobject);
debugMsg('myobject:',myobject);
await base.getTable('Event Template Details').createRecordAsync(myobject);
debugMsg('done!');


function prepFieldsObject (recordToClone, theCloneFields, zreturnObject) {
    let fieldsObject = {};
    let returnObject = {};
    debugMsg('returnObject:', returnObject);
    
    for (let aField of theCloneFields) {
        fieldsObject[aField] = recordToClone.getCellValue(aField) ;
//        returnObject.fields = recordToClone.getCellValue(aField) ;
        //fieldsObject.push(updateObject);
    }
    debugMsg('fieldsObject:', fieldsObject);
    return returnObject.fields = Object.assign(fieldsObject);
}



let updatedActionRecords = []; // There should be only 1
updatedActionRecords.push({
    id: logEntry.id,
    fields: {
        cloneActionsFieldName: "",
    },
  });

    // Update the new program log table with content placements
    infoMsg("Updating Program Log table with content placements");
    while (updatedActionRecords.length > 0) {
      await base
        .getTable("Program Log")
        .updateRecordsAsync(updatedActionRecords.slice(0, 50));
      updatedActionRecords = updatedActionRecords.slice(50);
    }
    output.markdown("# Generation complete");

const cloneNameField = "Break Name";
const cloneLinkedRecordsField = "x";
const cloneFields0 = "Break Start";
const cloneFields1 = "Included Types";
const cloneFields2 = "Max Duration";
const inputPrompt = 'Select a record to clone'

