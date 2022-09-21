/*jshint esversion: 8 */
// 'use strict';

const scriptName = "GenerateLog";  
const scriptVersion = "22-08-10 v19";
const consoleDebug = false;

output.markdown('# '+ scriptName);
output.markdown('Version '+ scriptVersion);

const errorlvl = 0,
    warnlvl = 1,
    infolvl = 2,
    debuglvl = 3,
    tracelvl = 4;
let msglvl = infolvl;
function errorMsg(tag, msg) {
    if (msglvl >= errorlvl) msgMsg('ERROR: ', tag, msg);
}
function warnMsg(tag, msg) {
    if (msglvl >= warnlvl) msgMsg('WARNING: ', tag, msg);
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
    Global variables
*/
var parametersRecord = await input.recordAsync('Parameters record to be used', base.getTable('Control Panel'));
var tracePlacementGroup = parametersRecord.getCellValueAsString("Trace Placement Group");
var traceContentItem = parametersRecord.getCellValueAsString("Trace Content Item");
var traceLevel = parametersRecord.getCellValue("Trace Number");
var traceCount = 2;

async function generateLog () {
/*   
    Generate Logs - read the Sync Broadcast Schedule and build the log with placeholders 
*/
const // Airtable Table, View, and Field name constants
    broadcastSchedule = 'Sync Broadcast Schedule',
    syncPrograms = 'Sync OTA Programs',
    scriptView = 'Script View',
    onAirExport = 'OnAir Export';

output.markdown('# Program Log Generator');

// Retrieve all the tables/records needed from Airtable to produce the log

const station = infoMsg('Generating program log for ' + parametersRecord.getCellValueAsString('Station'));

// Get all broadcast schedule records for our selected Program Log date
let logDayDetails = await base.getTable(broadcastSchedule).getView(scriptView).selectRecordsAsync();
debugMsg('Day Details: ', logDayDetails);

// Get core program data
let coreProgramData = await base.getTable(syncPrograms).getView(scriptView).selectRecordsAsync();
debugMsg('programs: ', coreProgramData);

// Get our template details
let programTemplateDetails = await base.getTable('Program Template Details').getView('Export').selectRecordsAsync();
debugMsg('Program Template Details: ', programTemplateDetails);


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

// Build fields array for creating the program log

const pgmTemplateFields = ['Program Template', 'Add/Overide 1', 'Add/Overide 2', 'Add/Overide 3'];

let newLogRecords = [];
// Loop thru the day template details
for (let logDayDetailsRecord of logDayDetails.records) {
    debugMsg('1 logDayDetailsRecord', logDayDetailsRecord);
    let scheduleProgramName = logDayDetailsRecord.getCellValueAsString('Title');
    for (let aCoreProgramRecord of coreProgramData.records ) {
        let coreProgramName = aCoreProgramRecord.getCellValueAsString('OTA Program');
        if (scheduleProgramName === coreProgramName) { // match on broadcast schedule and sync programs program names
            traceMsg('2 sched & prog match: ', coreProgramName);

            for (let aPgmTemplateFieldName of pgmTemplateFields) { // look at each program template field in core programs
                let programTemplateFromPrograms = aCoreProgramRecord.getCellValueAsString(aPgmTemplateFieldName);
                debugMsg('3 programTemplateFromPrograms', programTemplateFromPrograms);
                if (programTemplateFromPrograms != null) {
                    debugMsg('Adding log entries for program ' + logDayDetailsRecord.getCellValue('Title'));
                    traceMsg('dayTemplateDetailsRecord' + logDayDetailsRecord);
                    traceMsg('dayTemplateDetailsRecord INSP', aCoreProgramRecord.getCellValue('OTA Program'));

                    // Now loop thru the program template details
                    for (let programTemplateDetailsRecord of programTemplateDetails.records) {
                        let programTemplateFromProgramTemplateDetails = programTemplateDetailsRecord.getCellValueAsString('Program Template');
                        if (programTemplateFromProgramTemplateDetails === programTemplateFromPrograms) {
                            traceMsg('programTemplateFromDayTemplateDetails: ' + programTemplateFromPrograms);
                            traceMsg("programTemplateDetailsRecord.getCellValue('Program Template Duration'),", programTemplateDetailsRecord.getCellValue('Program Template Duration'));
                            newLogRecords.push({
                                fields: {
                                    'Log Title': parametersRecord.getCellValue('Log Title'),
                                    'Station': parametersRecord.getCellValue('Station'),
                                    'Program Log Date': parametersRecord.getCellValue('Program Log Date'),
                                    DOW: parametersRecord.getCellValue('Day of Week'),
                                    'Program Name': aCoreProgramRecord.getCellValue('Core Program Name'),
                                    'Program Start': logDayDetailsRecord.getCellValue('Local Start Time as Duration'),
                                    'Program Template Duration': programTemplateDetailsRecord.getCellValue('Program Template Duration'),
                                    'Break Name': programTemplateDetailsRecord.getCellValue('Break Name'),
                                    'Max Duration': programTemplateDetailsRecord.getCellValue('Max Duration'),
                                    Sequence: programTemplateDetailsRecord.getCellValue('Sequence'),
                                    'Break Start': programTemplateDetailsRecord.getCellValue('Break Start'),
                                    'Included Types': programTemplateDetailsRecord.getCellValue('Included Types String'),
                                    'Program Template': programTemplateDetailsRecord.getCellValueAsString('Program Template'),
//                                    'Day Template': 'nope',
                                    'Content Placement Status': 'Empty',
                                    Content: '',
                                    'Content Start': 0,
                                    'Dur': 0,
                                },
                            });
                            continue;
                        }
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
}

async function placeContent () {
    
    /*   
        Place Content 2020-11-09 v2
    
        ==================================================================================================================
        =================================    P L A C E   C O N T E N T                    ================================
        ==================================================================================================================
        ==================================================================================================================
    */
    output.markdown("## Placing Content . . . ");
    infoMsg("Placing Content in Program Log");
    
    let updatedLogRecords = []; // Will hold updates to the Program Log table for  processing in batches (Airtable restriction)
    
    // Initialize duration calculation logic
    let lastProgram = "";
    let lastBreak = "";
    let lastContentDuration = -1;
    let lastContentStart = -1;
    let lastSequence = -1;
    let thisLogEntryDuration = -1;
    let adjustedStart = -1;
    
    // Get all the data we'll we working with
    
    debugMsg("parametersRecord: ", parametersRecord);
    let programLogDate = parametersRecord.getCellValue("Program Log Date");
    
    let playbackDevices = await base
      .getTable("Media Playback Devices")
      .getView("OnAir Export")
      .selectRecordsAsync();
    debugMsg("playbackDevices", playbackDevices);
    let contentTypes = await base
      .getTable("Content Types")
      .getView("OnAir Export")
      .selectRecordsAsync();
    debugMsg("contentTypes", contentTypes);
    let contentItems = await base
      .getTable("Content Items")
      .getView("OnAir Export")
      .selectRecordsAsync();
    debugMsg("contentItems", contentItems);
    let logEntries = await base
      .getTable("Program Log")
      .getView("OnAir Export")
      .selectRecordsAsync();
    debugMsg("logEntries", logEntries);
    let placementGroups = await base
      .getTable("Placement Groups")
      .getView("OnAir Export")
      .selectRecordsAsync();
    debugMsg("PlacementGroups", placementGroups);
    
    // Create Array of Placement Groups unable to be placed due to today's date
    // or todays day of the week.
    const placementFailReason = Array(placementGroups.records.length).fill("");
    const placementFailGroup = Array(placementGroups.records.length).fill("");
    
    // Create an array of placement group records and their last update time
    // with related content item records and their last update time.
    // Initialize all 'last updated' times to a random negative number so
    // that 'least recently placed' logic chooses them.
    const lpaGroupRecordIdx = 0,
      lpaGroupupdateIdx = 1,
      lpaMinimumPlacements = 2,
      lpaPlacements = 3,
      lpaItemRecordsIdx = 4,
      lpacontentItemUpdatesIdx = 5;
    let contentGroupLastPlacedArray = [];
    let contentItemPointers = [];
    if (placementGroups.records.length < 1 ) {
        output.markdown("## Error: No Placement Groups found ");
    } else {
        for (let aPlacementGroupRecord of placementGroups.records) {
            let lastPlacedEntry = [];
            let contentItemRecords = [];
            let contentItemUpdates = [];
            let groupPlacementMinimum = aPlacementGroupRecord.getCellValue("Minimum Placements");
            contentItemPointers = aPlacementGroupRecord.getCellValue("Content Items");
            debugMsg("contentItemPointers", contentItemPointers);
            if (contentItemPointers !== null) {
                for (let contentPointer of contentItemPointers) {
                    traceMsg("Content Item Loop", contentPointer.name);
                    traceMsg("Content Item id", contentPointer.id);
                    for (let contentRecord of contentItems.records) {
                        if (contentPointer.id === contentRecord.id) {
                            contentItemRecords.push(contentRecord);
                            contentItemUpdates.push(Math.floor(Math.random() * -10));
                        }
                    }
                }
            } else {
              output.markdown("## Error: Placement group has no content: "+ contentGroupsRecord.getCellValueAsString("Placement Group"));  
            }
        if (contentItemRecords.length != 0) {
            lastPlacedEntry.push(aPlacementGroupRecord, Math.floor(Math.random() * -10), groupPlacementMinimum, 0, contentItemRecords, contentItemUpdates);
            contentGroupLastPlacedArray.push(lastPlacedEntry);
          }
        }
      }
      debugMsg("contentGroupLastPlacedArray", contentGroupLastPlacedArray);

    
    // Attempt to place content in each Program Log Record
    LogEntries: for (let logEntry of logEntries.records) {
          // Create a string of useful info to display
        let logInfoString = "Log Entry " + logEntry.getCellValue("Log Entry Time Str") 
                          + " #" + logEntry.getCellValue("Sequence") + " ";
  
      let logEntryStart = logEntry.getCellValue("Sequence Start");
      debugMsg("At top of log entry loop with entry: ", logEntryStart);
      traceMsg("logEntry", logEntry);
      let logEntryType = logEntry.getCellValueAsString("Included Types");
      traceMsg("Log Entry Type", logEntryType);
      if (logEntryStart === -1) {
        // msglvl = tracelvl;
        traceMsg("found it!");
      }
    
      // Initialize flags for all placement rule checks
      let contentGroupDowAffinityMatch = false;
      let todOK = false;
      let minimumPlacementIntervalMatch = false;
    
      // Describes the content item caclulated as best placement for this log entry
      let matchingItem = -1;
      let matchingItemIndex = -1;
      let matchingContentGroup = -1;
      let matchingContentGroupIndex = -1;
    
      // Create/initalize content placement candidates, which hold all content that
      // passes all content placement rules for this entry.
      let placementCandidates = [];
      let placementPriority = -1;
      let placementIndex = -1;
    
      /*
        Content rules loop: find all content items that meet all the placement rules
        for this Program log entry and accumulate them in the placementCandidates structure.
        */
    
      // Loop thru each Placement Group looking for placement matchs
  
    
      PlacementGroups: for (let aPlacementGroup of placementGroups.records) {

        let thisPlacementGroup = aPlacementGroup.getCellValueAsString("Placement Group");
        let placementInfo = " " + thisPlacementGroup + " in " +logInfoString;


        // Support for conditional logging of a single placement group
        if (tracePlacementGroup == thisPlacementGroup) {
          msglvl = traceLevel; 
          debugMsg ("Enabling trace for: " + tracePlacementGroup);
        } else {
          debugMsg ("Disabling trace.");
          msglvl = infolvl; 
        }

        debugMsg("At top of placement group loop: " + placementInfo);

        ++placementIndex;
        if ((placementFailReason[placementIndex]).length > 0) {
            placementFailGroup[placementIndex] = aPlacementGroup.getCellValueAsString("Placement Group");
            debugMsg("Skipping Placement Group: " + placementFailGroup[placementIndex]);
            continue PlacementGroups;
        }


        
        // Check Start and end dates
        traceMsg(
          "Effective date",
          aPlacementGroup.getCellValue("Effective Date")
        );
        traceMsg(
          "Expiration date",
          aPlacementGroup.getCellValue("Expiration Date")
        );
        if (
          (programLogDate >= aPlacementGroup.getCellValue("Effective Date") ||
            aPlacementGroup.getCellValue("Effective Date") === null) &&
          (programLogDate <= aPlacementGroup.getCellValue("Expiration Date") ||
            aPlacementGroup.getCellValue("Expiration Date") === null)
        ) {
          traceMsg("Placement Group effective/expiration date checks OK.");
        } else {
          debugMsg("Effective/expiration date fail for: " + placementInfo);
            placementFailReason[placementIndex] = "Effective/expiration date fail";
          continue PlacementGroups;
        }
    
        // Check for a match on Program Name
        let programMatchString = aPlacementGroup.getCellValue("Program Name Match");
        traceMsg("programMatchString: ", programMatchString);
        if (programMatchString === null) {
          traceMsg("No program match string supplied for " + thisPlacementGroup);
        } else {
          let logProgramName = logEntry.getCellValueAsString("Program Name");
          traceMsg("Log entry Program Name: ", logProgramName);
          if (logProgramName.search(programMatchString) >= 0) {
            debugMsg(
              aPlacementGroup.getCellValue("Placement Group") +
                "  Match on Program Name:" +
                logProgramName +
                " programMatchString:" +
                programMatchString
            );
          } else {
            debugMsg("Failed to match on Program name for " + placementInfo);
            continue PlacementGroups;
          }
        }
    
        // Check for a match on Program TEMPLATE Name
        let programTemplateMatchString = aPlacementGroup.getCellValue(
          "Program Template Match"
        );
        traceMsg("programTemplateMatchString: ", programTemplateMatchString);
        if (programTemplateMatchString === null) {
          traceMsg("No template match string supplied");
        } else {
          let logProgramTemplateName = logEntry.getCellValueAsString(
            "Program Template"
          );
          traceMsg("Log entry Program Template Name: ", logProgramTemplateName);
          if (logProgramTemplateName.search(programTemplateMatchString) >= 0) {
            debugMsg(
              aPlacementGroup.getCellValue("Placement Group") +
                "  Match on Program Template Name:" +
                logProgramTemplateName +
                " programTemplateMatchString:" +
                programTemplateMatchString
            );
          } else {
            debugMsg("Failed to match on Program name for" + placementInfo);
            continue PlacementGroups;
          }
        }
    
        // Check that content can be placed on the DOW (Day Of Week) of this log
        let logEntryDow = logEntry.getCellValueAsString("DOW");
        let contentGroupDow = aPlacementGroup.getCellValueAsString(
          "Days to Place"
        );
        traceMsg("Log entry DOW", logEntryDow);
        if (contentGroupDow === "") {
          contentGroupDow = "Mon/Tue/Wed/Thu/Fri/Sat/Sun";
        }
        traceMsg("Placement Group DOW Affinity", contentGroupDow);
        if (contentGroupDow.search(logEntryDow) >= 0) {
          contentGroupDowAffinityMatch = true;
          matchingContentGroup = aPlacementGroup;
          traceMsg(
            "DOW Affinity match ",
            matchingContentGroup.getCellValueAsString("Placement Group")
          );
        } else {
          debugMsg("NO DOW Affinity match for" + placementInfo);
                    placementFailReason[placementIndex] = "Day of week fail";
          continue PlacementGroups;
        }
    


        // Check that placement group can be placed at time of day

        todOK = false;
        let incCount = 0,
        exCount = 0,
        includedMinimumTod = 0,
        includedMaximumTod = 0,
        excludedMinimumTod = 0,
        excludedMaximumTod = 0;

        includedMinimumTod = aPlacementGroup.getCellValue("Start Including");
        includedMaximumTod = aPlacementGroup.getCellValue("Stop Including");
        excludedMinimumTod = aPlacementGroup.getCellValue("Start Excluding");
        excludedMaximumTod = aPlacementGroup.getCellValue("Stop Excluding");
        traceMsg("Checking TOD for group ",matchingContentGroup.getCellValueAsString("Placement Group"));
        traceMsg("Checking TOD for Entry at ",logEntry.getCellValue("Log Entry Time Str"));
        traceMsg("Checking logEntryStart ", logEntryStart);
    
        if (includedMinimumTod !== null) {
          traceMsg("Included MinimumTod", convertHMS(includedMinimumTod));

          incCount++;
        } else {
          includedMinimumTod = 0;
          traceMsg("Inc Min null");
        }
        if (includedMaximumTod !== null) {
          traceMsg("Included MaximumTod", convertHMS(includedMaximumTod));
          incCount++;
        } else {
          includedMaximumTod = 83110;
          traceMsg("Inc Max null");
        }
        if (excludedMaximumTod !== null) {
          traceMsg("Excluded MaximumTod", convertHMS(excludedMaximumTod));
          exCount++;
        } else {
          excludedMaximumTod = -1;
          traceMsg("Ex Max null");
        }
        if (excludedMinimumTod !== null) {
          traceMsg("Excluded MinimumTod", convertHMS(excludedMinimumTod));
          exCount++;
        } else {
          excludedMinimumTod = -1;
          traceMsg("Ex Min null");
        }
        if (exCount === 0 && incCount === 0) {
          traceMsg("No TOD Constraints");
          todOK = true;
        } else {
          if (incCount != 0 && exCount != 0) {
            errorMsg(
              "Both Time of Day Include and Exclude paramters present.  Ignoring Include paramters for" + placementInfo
            );
          }
          if (excludedMaximumTod != -1 || excludedMinimumTod != -1) {
            traceMsg("TOD Exclusions");
            if (excludedMaximumTod === -1) excludedMaximumTod = 83110;
            if (excludedMinimumTod === -1) excludedMinimumTod = 0;
            if (
              logEntryStart >= excludedMaximumTod ||
              logEntryStart <= excludedMinimumTod
            ) {
              todOK = true;
            } else {
              traceMsg("TOD check failed");
            }
          } else {
            traceMsg("TOD INclusions");
            if (
              logEntryStart <= includedMaximumTod &&
              logEntryStart >= includedMinimumTod
            ) {
              todOK = true;
            }
          }
        }
        if (!todOK) {
          debugMsg("TOD check didn't pass for" + placementInfo);
          continue PlacementGroups;
        }
        traceMsg("TOD check AOK");
    
        // Check that this group has not exceeded its max placements or was too recently placed
    
        let minimumPlacementInterval = matchingContentGroup.getCellValue(
          "Minimum Placement Interval"
        );
        if (minimumPlacementInterval === null) minimumPlacementInterval = 0;
        let placementMax = matchingContentGroup.getCellValue("Maximum Placements");
        if (placementMax === null) placementMax = Number.POSITIVE_INFINITY;
        let groupLastPlaced = -1;
        let groupLastPlacedIndex = 0;
        let groupLastPlacedRecord = 0;
        let groupPlacementCount = 0;
    
        traceMsg(
          "Minimum Placement Interval for group: " +
            matchingContentGroup.getCellValueAsString("Placement Group"),
          minimumPlacementInterval
        );
        traceMsg(
          "Max placements for group: " +
            matchingContentGroup.getCellValueAsString("Placement Group"),
          placementMax
        );
    
        // Find the entry for the current placement group in the contentGroupLastPlacedArray
        for (let lastPlacedEntry of contentGroupLastPlacedArray) {
          // traceMsg("groupLastPlacedIndex in loop", groupLastPlacedIndex);
          if (lastPlacedEntry[lpaGroupRecordIdx] === matchingContentGroup) {
            groupLastPlacedRecord = lastPlacedEntry[lpaGroupRecordIdx];
            groupLastPlaced = lastPlacedEntry[lpaGroupupdateIdx];
            groupPlacementCount = lastPlacedEntry[lpaPlacements];
            traceMsg(
              matchingContentGroup.getCellValueAsString("Placement Group") +
                " groupLastPlaced: " +
                groupLastPlaced
            );
            break;
          }
          groupLastPlacedIndex++;
        }
        if (groupLastPlacedRecord === 0) {
          errorMsg(
            "Internal logic error.  Can't locate last placed pair for ",
            matchingContentGroup.getCellValueAsString("Placement Group")
          );
          return;
        }
        debugMsg("Matching Content group " + matchingContentGroup.getCellValueAsString("Placement Group") 
            + " last placed at: " + convertHMS(groupLastPlaced));
        traceMsg("Matching groupLastPlacedIndex", groupLastPlacedIndex);
        traceMsg("groupLastPlaced", groupLastPlaced);
        traceMsg("matchingContentGroup", matchingContentGroup);
        traceMsg("minimumPlacementInterval", minimumPlacementInterval);
        traceMsg("logEntryStart", logEntryStart);
        traceMsg("minimumPlacementIntervalMatch", minimumPlacementIntervalMatch);
    
        // Check that group was not used in the last 'Minimum Placement Interval'
    
        if (
          groupLastPlaced <= -1 ||
          logEntryStart - groupLastPlaced >= minimumPlacementInterval
        ) {
          minimumPlacementIntervalMatch = true;
          traceMsg(
            "Interval check AOK for ",
            matchingContentGroup.getCellValueAsString("Placement Group") + " at time: " +logEntry.getCellValue("Log Entry Time Str")
          );
        } else {
          debugMsg("Failed interval check for" + placementInfo);
          continue PlacementGroups;
        }
    
        // Check prior placements to be sure we don't exceed maximum placements
    
        if (groupPlacementCount < placementMax) {
          traceMsg(
            "Max Placements check AOK for ",
            matchingContentGroup.getCellValueAsString("Placement Group")
          );
          debugMsg(placementInfo + "passed all rules.");
        } else {
          debugMsg("Failed max placements check" + placementInfo);
          continue PlacementGroups;
        }
    
        // For this group check if any Item's Content Type matches the log entry's required type
        let contentTypeItem = 0;
        contentItemPointers = matchingContentGroup.getCellValue("Content Items");
        traceMsg("contentItemPointers", contentItemPointers);
        traceMsg("Checking Content Type of items in group ",matchingContentGroup.getCellValueAsString("Placement Group"));
    
        // Use the list of content items in the current group record to search thru all
        // content item records that are in the current group.  For each content record
        // in the current group, check if its content type matches the current log entry's
        // required content type.
        let itemContentTypeMatch = false;
    
        ItemTypeCheck: for (let contentPointer of contentItemPointers) {
          traceMsg("Content Item Loop", contentPointer.name);
          traceMsg("Content Item id", contentPointer.id);
          for (let contentRecord of contentItems.records) {
            if (contentPointer.id === contentRecord.id) {
              if (logEntryType.search(contentRecord.getCellValueAsString("Item Content Type")) >= 0) {
                let matchPair = [];
                // We have an item that can be placed.  Add it to our candidate list.
                debugMsg("Matching Item Name",contentRecord.getCellValueAsString("Item Name"));
                debugMsg("Matching Item Content Type",contentRecord.getCellValueAsString("Item Content Type"));
                debugMsg("logEntryType", logEntryType);
                // Content ordered by priority.  The first matching content is the highest priority match.
                if (placementPriority === -1) {
                  placementPriority = matchingContentGroup.getCellValue("Placement Order");
                }
                // If the priority of this placement group is not the same as the placementPriority then
                // its lower priority; skip it.
                if (matchingContentGroup.getCellValue("Placement Order") != placementPriority ) {
                  debugMsg("Placement priority too low for placement group",  + placementInfo);
                  continue PlacementGroups;
                }
                contentTypeItem = contentRecord;
                itemContentTypeMatch = true;
                matchPair.push(matchingContentGroup, contentTypeItem);
                placementCandidates.push(matchPair);
                traceMsg("placementCandidates", placementCandidates);
                continue ItemTypeCheck;
              }
            }
          }
        }
        if (itemContentTypeMatch) {
            debugMsg("For"  + placementInfo + "Item Content Type match found" + contentTypeItem.getCellValueAsString("Item Content Type"));
            } else {
            debugMsg("Item Type Mismatch for"  + placementInfo);
            }
      } // End of PlacementGroups Loop
    
      /*
        We now have a list of all content that could potentially be placed in the current log entry.
        Find the content item in the placementCandidates structure that was least recently placed. 
        If we place that item then we'll wind up rotating placement groups and itmes so that we evenly
        distribute content throughout the broadcast day.
        */
    
      if (placementCandidates.length > 0) {
        debugMsg("Found placement Candidates", placementCandidates);
      } else {
        traceMsg("No hits for this log entry");
        base.getTable("Program Log").updateRecordAsync(logEntry.id, {
          "Content Placement Status": "Unable to Place Content",
        });
        errorMsg("Was unable to place any content for Placeholder at ",logEntry.getCellValue("Log Entry Time Str"));
        continue LogEntries;
      }
    
      // Select a placement gourp candidate that has not been placed yet.
      // If all candidates have already been placed, select the one least recently placed.
      let oldestPlacementTime = Number.POSITIVE_INFINITY;
      let oldestGroupIdx = -1;
      for (let placementEntry of placementCandidates) {
        // iterate over placments candidates
        let placementGroup = placementEntry[0];
        traceMsg("placementGroup", placementGroup);
        let groupIndex = 0;
        for (let lastPlacedEntry of contentGroupLastPlacedArray) {
          // Iterate over last placed groups
          let lastPlacedGroupRecord = lastPlacedEntry[lpaGroupRecordIdx];
          let lastPlacedGroupTime = lastPlacedEntry[lpaGroupupdateIdx];
          if (placementGroup === lastPlacedGroupRecord) {
            if (lastPlacedGroupTime < oldestPlacementTime) {
              traceMsg("new oldest");
              traceMsg("oldestPlacementTime", oldestPlacementTime);
              traceMsg("lastPlacedEntry", lastPlacedEntry);
              traceMsg("lastPlacedGroupRecord", lastPlacedGroupRecord);
              traceMsg(
                "group Name",
                lastPlacedGroupRecord.getCellValueAsString("Placement Group")
              );
              oldestPlacementTime = lastPlacedGroupTime;
              oldestGroupIdx = groupIndex;
              traceMsg("oldestGroupIdx", oldestGroupIdx);
            }
          }
          groupIndex++;
        }
      }
      traceMsg("oldestGroupIdx", oldestGroupIdx);
      traceMsg("matchingContentGroup", matchingContentGroup);
      matchingContentGroup =
        contentGroupLastPlacedArray[oldestGroupIdx][lpaGroupRecordIdx];
    
      // Now search all plaacement candidates with a matching placement group and find the
      // candidate with an item whose placed time is oldest.
      let oldestItemIdx = 0;
      oldestPlacementTime = Number.POSITIVE_INFINITY;
      {
        let lastPlacedEntry = contentGroupLastPlacedArray[oldestGroupIdx];
        let lastPlacedGroupRecord = lastPlacedEntry[lpaGroupRecordIdx];
        let lastPlacedGroupTime = lastPlacedEntry[lpaGroupupdateIdx];
        let lastPlacedItemRecords = lastPlacedEntry[lpaItemRecordsIdx];
        let lastPlacedItemTimes = lastPlacedEntry[lpacontentItemUpdatesIdx];
        for (let placementEntry of placementCandidates) {
          // iterate over placments candidates
          let placementGroup = placementEntry[0];
          let placementItem = placementEntry[1];
          if (placementGroup === matchingContentGroup) {
            let itemIndex = 0;
            for (let itemRecord of lastPlacedItemRecords) {
              // Iterate over last placed items
              if (placementItem === itemRecord) {
                // Only look at items that match placement item
                if (lastPlacedItemTimes[itemIndex] < oldestPlacementTime) {
                  traceMsg("new oldest");
                  traceMsg("oldestPlacementTime", oldestPlacementTime);
                  traceMsg(
                    "lastPlacedItemTimes[itemIndex]",
                    lastPlacedItemTimes[itemIndex]
                  );
                  traceMsg("lastPlacedEntry", lastPlacedEntry);
                  traceMsg("lastPlacedGroupRecord", lastPlacedGroupRecord);
                  traceMsg(
                    "group Name",
                    lastPlacedGroupRecord.getCellValueAsString("Placement Group")
                  );
                  traceMsg(
                    "item Name",
                    itemRecord.getCellValueAsString("Item Name")
                  );
                  traceMsg("lastPlacedItemRecords", lastPlacedItemRecords);
                  oldestPlacementTime = lastPlacedItemTimes[itemIndex];
                  oldestItemIdx = itemIndex;
                  traceMsg("oldestGroupIdx", oldestGroupIdx);
                  traceMsg("itemIndex", itemIndex);
                }
              }
              itemIndex++;
            }
          }
        }
      }
      matchingItem =
        contentGroupLastPlacedArray[oldestGroupIdx][lpaItemRecordsIdx][
          oldestItemIdx
        ];
    
      // We have the content item we want to place in the current log entry.  Update the 'last placed' time
      // for both placement group and content entry.
      traceMsg(
        "contentGroupLastPlacedArray prior to update",
        contentGroupLastPlacedArray
      );
      traceMsg("oldestItemIdx", oldestItemIdx);
      contentGroupLastPlacedArray[oldestGroupIdx][lpaGroupupdateIdx] = logEntryStart;
      contentGroupLastPlacedArray[oldestGroupIdx][lpacontentItemUpdatesIdx][oldestItemIdx] = logEntryStart;
      contentGroupLastPlacedArray[oldestGroupIdx][lpaPlacements]++;
   
      traceMsg("matchingContentGroup", matchingContentGroup);
      traceMsg("matchingItem", matchingItem);
      traceMsg("placementCandidates", placementCandidates);
      traceMsg("contentGroupLastPlacedArray", contentGroupLastPlacedArray);
    
      // Update content start if not start of sequence
      if (
        logEntry.getCellValueAsString("Program Name") === lastProgram &&
        logEntry.getCellValueAsString("Break Name") === lastBreak
      ) {
        adjustedStart = lastContentStart + lastContentDuration;
        traceMsg("Adjusted start to ", adjustedStart);
        traceMsg("Cnt start ", logEntry.getCellValue("Content Start"));
      } else {
        adjustedStart = logEntry.getCellValue("Content Start");
        traceMsg("Adjusted kept at content start ", adjustedStart);
      } 
    
      // Place our matching content in the log entry!
      debugMsg(
        "Content will be placed from " +
          matchingItem.getCellValueAsString("Item Name") +
          "  Placement Group: ",
        matchingContentGroup.getCellValueAsString("Placement Group")
      );
      traceMsg("Content Placement Status", "Content Placed");
      traceMsg(
        "Content Duration Secs",
        matchingItem.getCellValue("Content Duration Secs")
      );
      traceMsg(
        "Playback Device",
        matchingItem.getCellValueAsString("Playback Device")
      );
      traceMsg("Track/URL", matchingItem.getCellValueAsString("Track/URL"));
      traceMsg("Script", matchingItem.getCellValueAsString("Script"));
    
      updatedLogRecords.push({
        id: logEntry.id,
        fields: {
          Content: matchingItem.getCellValueAsString("Item Name"),
          "Content Placement Status": "Content Placed",
          "Included Types": matchingItem.getCellValueAsString("Item Content Type"),
          "Dur": matchingItem.getCellValue("Content Duration Secs"),
          "Placement Group": matchingContentGroup.getCellValue("Placement Group"),
          "Playback Device": matchingItem.getCellValueAsString("Playback Device"),
          "Track/URL": matchingItem.getCellValueAsString("Track/URL"),
          Script: matchingItem.getCellValueAsString("Script"),
          "Content Start": adjustedStart,
        },
      });
    
      // now update our state
      traceMsg("Content (dur)", matchingItem.getCellValueAsString("Item Name"));
      traceMsg("lastProgram", lastProgram);
      traceMsg("lastBreak", lastBreak);
      traceMsg("lastContentDuration", lastContentDuration);
      traceMsg("lastProgram", lastProgram);
      traceMsg("lastContentStart", lastContentStart);
      traceMsg("lastSequence", lastSequence);
      lastProgram = logEntry.getCellValueAsString("Program Name");
      lastBreak = logEntry.getCellValueAsString("Break Name");
      lastContentDuration = matchingItem.getCellValue("Content Duration Secs");
      lastContentStart = adjustedStart;
      traceMsg("lastContentDuration", lastContentDuration);
      traceMsg(logEntry.getCellValueAsString("Break Name"));
      traceMsg(logEntry.getCellValueAsString("Content Start"));
      traceMsg(logEntry.getCellValueAsString("Dur"));
    
      traceMsg("Content placed for " + logEntry.getCellValue("Sequence Start"));
      traceMsg(
        "contentGroupLastPlacedArray after placement",
        contentGroupLastPlacedArray
      );
      debugMsg(
        "Reached end of placement loop for ",
        +logEntry.getCellValue("Sequence Start")
      );
    } // end of log entry placement loop



    // Update the new program log table with content placements
    infoMsg("Updating Program Log table with content placements");
    while (updatedLogRecords.length > 0) {
      await base
        .getTable("Program Log")
        .updateRecordsAsync(updatedLogRecords.slice(0, 50));
      updatedLogRecords = updatedLogRecords.slice(50);
    }
    output.markdown("# Generation complete");
    

    // Print out a 'Date Fail list'
    output.markdown("# Placement Group Date Fail report");
    for (placementIndex =0; placementIndex < placementFailGroup.length; ++placementIndex) {
        if ((placementFailReason[placementIndex]).length > 0) {
            output.markdown(placementFailGroup[placementIndex] + ": " + placementFailReason[placementIndex]);
        }
      }
    // Print out a 'bump list'
    output.markdown("# Placement Group 'bump report'");
    for (let lastPlacedEntry of contentGroupLastPlacedArray) {
            groupPlacementCount = lastPlacedEntry[lpaPlacements];
            groupLastPlacedRecord = lastPlacedEntry[lpaGroupRecordIdx];
            if (groupPlacementCount < lastPlacedEntry[lpaMinimumPlacements]) {
              if (!placementFailGroup.includes(groupLastPlacedRecord.getCellValueAsString("Placement Group")) ) {
                output.markdown(groupLastPlacedRecord.getCellValueAsString("Placement Group")
                + ": Minimum Placements: " + lastPlacedEntry[lpaMinimumPlacements]
                + " Actual Placements: " + groupPlacementCount);
              }
            }
        }
debugMsg("contentGroupLastPlacedArray", contentGroupLastPlacedArray);

}
    
function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
}    
    
    /*
        Main logic
    */

        //     warnlvl = 1,     infolvl = 2,     debuglvl = 3,     tracelvl = 4; msglvl = infolvl;
        // msglvl = debuglvl;

debugMsg('parametersRecord: ', parametersRecord);
infoMsg ("Trace Placement Group: " + tracePlacementGroup);
infoMsg ("Trace Content Item: " + traceContentItem);
infoMsg ("Trace Number: " + traceLevel); 
await generateLog();

await placeContent();
