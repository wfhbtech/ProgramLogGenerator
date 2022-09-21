function dbMsg (theMessage) {
    console.debug (theMessage);
    }

    dbMsg('InsertControlPanelRecord-2022-04-05v1');
const controlPanel = 'Control Panel';
const broadcastSChedule = 'Sync Broadcast Schedule';
const scriptView = 'Script View';
const automationView = 'Automation View';

// Get the control panel record (should be only one) 
let controlPanelRecords = await base.getTable(controlPanel).getView(scriptView).selectRecordsAsync();
dbMsg('controlPanelRecords: ');
dbMsg(controlPanelRecords);

let myTable = base.getTable(controlPanel);
// let controlPanelRecord = await input.recordAsync('Select a record to use', myTable);
let controlPanelRecord = controlPanelRecords.records[0];
dbMsg('controlPanelRecord: ');
dbMsg(controlPanelRecord);

// Get all broadcast schedule records for our selected Program Log date
let broadcastRecords = await base.getTable(broadcastSChedule).getView(automationView).selectRecordsAsync();
dbMsg('broadcastRecords: ');
dbMsg(broadcastRecords);

let updateOperations = [];

for (let aBroadcast of broadcastRecords.recordIds) {
    updateOperations.push(
        {
          "id": aBroadcast,
          "fields": {
            "Control Panel" :  [ controlPanelRecord ],
          }
        }
    );
}
console.debug('updateOperations');
console.debug(updateOperations);

while (updateOperations.length > 0) {
    await base.getTable(broadcastSChedule).updateRecordsAsync(updateOperations.slice(0, 50));
    updateOperations = updateOperations.slice(50);
}

