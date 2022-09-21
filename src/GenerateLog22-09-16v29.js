/*jshint esversion: 8 */
// 'use strict';

const scriptName = 'GenerateLog';
const scriptVersion = '22-09-16 v29';
const consoleDebug = false;

output.markdown('# Generating Program Log');
output.markdown('Script Name: ' + scriptName + ' Version ' + scriptVersion);

/*   
    Global variables
*/
var parametersRecord = await input.recordAsync(
    'Parameters record to be used: . ',
    base.getTable('Control Panel')
);
var tracePlacementGroup = parametersRecord.getCellValueAsString(
    'Trace Placement Group'
);
var traceCopyItem = parametersRecord.getCellValueAsString('Trace Copy Item');
var traceLogTime = parametersRecord.getCellValueAsString('Log Time');
var traceLevel = parametersRecord.getCellValue('Trace Number');
var traceCount = 2;

var lastUpdateTime = new Date(); // Start time of the script

async function generateLog() {
    /*   
    Generate Logs - read the Sync Broadcast Schedule and build the log with placeholders 
*/
    const // Airtable Table, View, and Field name constants
        broadcastSchedule = 'Sync Broadcast Schedule',
        syncPrograms = 'Sync OTA Programs',
        scriptView = 'Script View',
        onAirExport = 'OnAir Export';

    // Retrieve all the tables/records needed from Airtable to produce the log

    const station = debugMsg(
        'Generating program log for ' +
            parametersRecord.getCellValueAsString('Station')
    );

    output.markdown(
        "### Expanding Program Templates for today's broadcast schedule for station: " +
            parametersRecord.getCellValueAsString('Station')
    );

    // Get all broadcast schedule records for our selected Program Log date
    let logDayDetails = await base
        .getTable(broadcastSchedule)
        .getView(scriptView)
        .selectRecordsAsync();
    debugMsg('Day Details: ', logDayDetails);

    // Get core program data
    let coreProgramData = await base
        .getTable(syncPrograms)
        .getView(scriptView)
        .selectRecordsAsync();
    debugMsg('programs: ', coreProgramData);

    // Get our template details
    let programTemplateDetails = await base
        .getTable('Program Template Details')
        .getView('Export')
        .selectRecordsAsync();
    debugMsg('Program Template Details: ', programTemplateDetails);

    output.markdown('Purging old Program Log');

    // Purge old Program Log
    let logRecords = await base
        .getTable('Program Log')
        .getView('OnAir Export')
        .selectRecordsAsync();
    let recIDs = [];
    for (let record of logRecords.records) {
        recIDs.push(record.id);
    }
    while (recIDs.length > 0) {
        traceMsg(recIDs);
        await base
            .getTable('Program Log')
            .deleteRecordsAsync(recIDs.slice(0, 50));
        recIDs = recIDs.slice(50);
    }

    let createCount = 0;

    // Build fields array for creating the program log

    const pgmTemplateFields = [
        'Program Template',
        'Add/Overide 1',
        'Add/Overide 2',
        'Add/Overide 3',
    ];

    let newLogRecords = [];
    // Loop thru the day template details
    for (let logDayDetailsRecord of logDayDetails.records) {
        debugMsg('1 logDayDetailsRecord', logDayDetailsRecord);
        let scheduleProgramName =
            logDayDetailsRecord.getCellValueAsString('Program With Cue');
        for (let aCoreProgramRecord of coreProgramData.records) {
            let coreProgramName =
                aCoreProgramRecord.getCellValueAsString('OTA Program');
            if (scheduleProgramName === coreProgramName) {
                // match on broadcast schedule and sync programs program names
                traceMsg('2 sched & prog match: ', coreProgramName);

                for (let aPgmTemplateFieldName of pgmTemplateFields) {
                    // look at each program template field in core programs
                    let programTemplateFromPrograms =
                        aCoreProgramRecord.getCellValueAsString(
                            aPgmTemplateFieldName
                        );
                    debugMsg(
                        '3 programTemplateFromPrograms',
                        programTemplateFromPrograms
                    );
                    if (programTemplateFromPrograms != null) {
                        debugMsg(
                            'Adding log entries for program ' +
                                logDayDetailsRecord.getCellValue('Title')
                        );
                        traceMsg(
                            'dayTemplateDetailsRecord' + logDayDetailsRecord
                        );
                        traceMsg(
                            'dayTemplateDetailsRecord INSP',
                            aCoreProgramRecord.getCellValue('OTA Program')
                        );

                        // Now loop thru the program template details
                        for (let programTemplateDetailsRecord of programTemplateDetails.records) {
                            let programTemplateFromProgramTemplateDetails =
                                programTemplateDetailsRecord.getCellValueAsString(
                                    'Program Template'
                                );
                            if (
                                programTemplateFromProgramTemplateDetails ===
                                programTemplateFromPrograms
                            ) {
                                traceMsg(
                                    'programTemplateFromDayTemplateDetails: ' +
                                        programTemplateFromPrograms
                                );
                                traceMsg(
                                    "programTemplateDetailsRecord.getCellValue('Program Template Duration'),",
                                    programTemplateDetailsRecord.getCellValue(
                                        'Program Template Duration'
                                    )
                                );
                                newLogRecords.push({
                                    fields: {
                                        'Log Title':
                                            parametersRecord.getCellValue(
                                                'Log Title'
                                            ),
                                        Station:
                                            parametersRecord.getCellValue(
                                                'Station'
                                            ),
                                        'Program Log Date':
                                            parametersRecord.getCellValue(
                                                'Program Log Date'
                                            ),
                                        DOW: parametersRecord.getCellValue(
                                            'Day of Week'
                                        ),
                                        'Program Name':
                                            aCoreProgramRecord.getCellValue(
                                                'Core Program Name'
                                            ),
                                        'Program Start':
                                            logDayDetailsRecord.getCellValue(
                                                'Local Start Time as Duration'
                                            ),
                                        'Program Template Duration':
                                            programTemplateDetailsRecord.getCellValue(
                                                'Program Template Duration'
                                            ),
                                        'Break Name':
                                            programTemplateDetailsRecord.getCellValue(
                                                'Break Name'
                                            ),
                                        'Max Duration':
                                            programTemplateDetailsRecord.getCellValue(
                                                'Max Duration'
                                            ),
                                        Sequence:
                                            programTemplateDetailsRecord.getCellValue(
                                                'Sequence'
                                            ),
                                        'Break Start':
                                            programTemplateDetailsRecord.getCellValue(
                                                'Break Start'
                                            ),
                                        'Included Types':
                                            programTemplateDetailsRecord.getCellValue(
                                                'Included Types String'
                                            ),
                                        'Program Template':
                                            programTemplateDetailsRecord.getCellValueAsString(
                                                'Program Template'
                                            ),
                                        Optional:
                                            programTemplateDetailsRecord.getCellValue(
                                                'Optional'
                                            ),
                                        'Copy Placement Status': 'Empty',
                                        Copy: '',
                                        'Copy Start': 0,
                                        Dur: 0,
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
        await base
            .getTable('Program Log')
            .createRecordsAsync(newLogRecords.slice(0, 50));
        newLogRecords = newLogRecords.slice(50);
    }
    output.markdown('Expansion Complete');
}

async function placeCopy() {
    /*   
        Place Copy 2020-11-09 v2
    
        ==================================================================================================================
        ==================================================================================================================
        ==================================================================================================================
        =================================    P L A C E   C O N T E N T                    ================================
        ==================================================================================================================
        ==================================================================================================================
        ==================================================================================================================
        ==================================================================================================================
        ==================================================================================================================
    */
    output.markdown('### Placing Copy in Program Log');

    let updatedLogRecords = []; // Will hold updates to the Program Log table for  processing in batches (Airtable restriction)

    // Initialize duration calculation logic
    let lastProgram = '';
    let lastBreak = '';
    let lastCopyDuration = -1;
    let lastCopyStart = -1;
    let lastSequence = -1;
    let thisLogEntryDuration = -1;
    let adjustedStart = -1;

    // Get all the data we'll we working with

    debugMsg('parametersRecord: ', parametersRecord);
    let programLogDate = parametersRecord.getCellValue('Program Log Date');

    let playbackDevices = await base
        .getTable('Media Playback Devices')
        .getView('OnAir Export')
        .selectRecordsAsync();
    debugMsg('playbackDevices', playbackDevices);
    let copyTypes = await base
        .getTable('Copy Types')
        .getView('OnAir Export')
        .selectRecordsAsync();
    debugMsg('copyTypes', copyTypes);
    let copyItems = await base
        .getTable('Copy Items')
        .getView('OnAir Export')
        .selectRecordsAsync();
    debugMsg('copyItems', copyItems);
    let logEntries = await base
        .getTable('Program Log')
        .getView('OnAir Export')
        .selectRecordsAsync();
    debugMsg('logEntries', logEntries);
    let placementGroups = await base
        .getTable('Placement Groups')
        .getView('OnAir Export')
        .selectRecordsAsync();
    debugMsg('PlacementGroups', placementGroups);

    // Create Array of Placement Groups unable to be placed due to today's date
    // or todays day of the week.
    const placementFailReason = Array(placementGroups.records.length).fill('');
    const placementFailGroup = Array(placementGroups.records.length).fill('');

    // Create an array of placement group records and their last update time
    // with related copy item records and their last update time.
    // Initialize all 'last updated' times to a random negative number so
    // that 'least recently placed' logic chooses them.
    const lpaGroupRecordIdx = 0, // Placement Group Record
        lpaGroupupdateIdx = 1, // Time Last Placed
        lpaMinimumPlacements = 2, // Minimum Required Placements
        lpaPlacements = 3, // Actual Placements so far
        lpaItemRecordsIdx = 4, // Copy records Array
        lpacopyItemUpdatesIdx = 5; // Copy records time last placed array
    let copyGroupLastPlacedArray = [];
    let copyItemPointers = [];
    if (placementGroups.records.length < 1) {
        output.markdown('# Error: No Placement Groups found ');
    } else {
        for (let aPlacementGroupRecord of placementGroups.records) {
            let lastPlacedEntry = [];
            let copyItemRecords = [];
            let copyItemUpdates = [];
            let groupPlacementMinimum =
                aPlacementGroupRecord.getCellValue('Minimum Placements');
            copyItemPointers = aPlacementGroupRecord.getCellValue('Copy Items');
            debugMsg('copyItemPointers', copyItemPointers);
            if (copyItemPointers !== null) {
                for (let copyPointer of copyItemPointers) {
                    traceMsg('Copy Item Loop', copyPointer.name);
                    traceMsg('Copy Item id', copyPointer.id);
                    for (let copyRecord of copyItems.records) {
                        if (copyPointer.id === copyRecord.id) {
                            copyItemRecords.push(copyRecord);
                            copyItemUpdates.push(
                                Math.floor(Math.random() * -10)
                            );
                        }
                    }
                }
            } else {
                output.markdown(
                    '# Error: Placement group has no copy: ' +
                        aPlacementGroupRecord.getCellValueAsString(
                            'Placement Group'
                        )
                );
            }
            if (copyItemRecords.length != 0) {
                lastPlacedEntry.push(
                    aPlacementGroupRecord,
                    Math.floor(Math.random() * -10),
                    groupPlacementMinimum,
                    0,
                    copyItemRecords,
                    copyItemUpdates
                );

                copyGroupLastPlacedArray.push(lastPlacedEntry);
            }
        }
    }

    // Attempt to place copy in each Program Log Record
    LogEntries: for (let logEntry of logEntries.records) {
        let logEntryStart = logEntry.getCellValue('Log Time');
        let optionalEntry = logEntry.getCellValue('Optional');
        // Support for conditional logging of a single log entry
        debugMsg(
            'logEntryStart: ' +
                logEntryStart +
                '   TraceLogTime: ' +
                traceLogTime
        );

        if (traceLogTime == logEntryStart) {
            msglvl = traceLevel;
            debugMsg(
                'Enabling trace for: ' +
                    convertHMS(logEntryStart) +
                    '  (' +
                    traceLogTime +
                    ')'
            );
        } else {
            debugMsg('Disabling trace for: ' + traceLogTime);
            msglvl = infolvl;
        }
        // Create a string of useful info to display
        let logInfoString =
            'Log Entry ' +
            logEntry.getCellValue('Log Entry Time Str') +
            ' #' +
            logEntry.getCellValue('Sequence') +
            ' ';

        debugMsg(
            'logEntryStart: ' +
                logEntryStart +
                '   TraceLogTime: ' +
                traceLogTime
        );

        debugMsg(
            'At top of log entry loop with entry: ',
            convertHMS(logEntryStart) + '(' + logEntryStart + ')'
        );
        traceMsg('logEntry', logEntry);
        let logEntryType = logEntry.getCellValueAsString('Included Types');
        traceMsg('Log Entry Type', logEntryType);
        if (logEntryStart === -1) {
            // msglvl = tracelvl;
            traceMsg('found it!');
        }

        // Initialize flags for all placement rule checks
        let copyGroupDowAffinityMatch = false;
        let todOK = false;
        let minimumPlacementIntervalMatch = false;

        // Describes the copy item caclulated as best placement for this log entry
        let matchingItem = -1;
        let matchingItemIndex = -1;
        let matchingCopyGroup = -1;
        let matchingCopyGroupIndex = -1;

        // Create/initalize copy placement candidates, which hold all copy that
        // passes all copy placement rules for this entry.
        let placementCandidates = [];
        let placementPriority = -1;
        let placementIndex = -1;

        /*
        Copy rules loop: find all copy items that meet all the placement rules
        for this Program log entry and accumulate them in the placementCandidates structure.
        */

        // Loop thru each Placement Group looking for placement matchs

        PlacementGroups: for (let aPlacementGroup of placementGroups.records) {
            let thisPlacementGroup =
                aPlacementGroup.getCellValueAsString('Placement Group');
            let placementInfo =
                ' ' + thisPlacementGroup + ' in ' + logInfoString;

            // Support for conditional logging of a single placement group
            if (traceLogTime != logEntryStart) {
                if (tracePlacementGroup == thisPlacementGroup) {
                    msglvl = traceLevel;
                    debugMsg('Enabling trace for: ' + tracePlacementGroup);
                } else {
                    debugMsg('Disabling trace.');
                    msglvl = infolvl;
                }
            }

            debugMsg('At top of placement group loop: ' + placementInfo);

            ++placementIndex;

            if (placementFailReason[placementIndex].length > 0) {
                placementFailGroup[placementIndex] =
                    aPlacementGroup.getCellValueAsString('Placement Group');
                debugMsg(
                    'Skipping Placement Group: ' +
                        placementFailGroup[placementIndex]
                );
                continue PlacementGroups;
            }

            // Check Start and end dates
            traceMsg(
                'Effective date',
                aPlacementGroup.getCellValue('Effective Date')
            );
            traceMsg(
                'Expiration date',
                aPlacementGroup.getCellValue('Expiration Date')
            );
            if (
                (programLogDate >=
                    aPlacementGroup.getCellValue('Effective Date') ||
                    aPlacementGroup.getCellValue('Effective Date') === null) &&
                (programLogDate <=
                    aPlacementGroup.getCellValue('Expiration Date') ||
                    aPlacementGroup.getCellValue('Expiration Date') === null)
            ) {
                traceMsg(
                    'Placement Group effective/expiration date checks OK.'
                );
            } else {
                debugMsg(
                    'Effective/expiration date fail for: ' + placementInfo
                );
                placementFailReason[placementIndex] =
                    'Effective/expiration date fail';
                continue PlacementGroups;
            }

            // Check for a match on Program Name
            let programMatchString =
                aPlacementGroup.getCellValue('Program Name Match');
            traceMsg('programMatchString: ', programMatchString);
            if (programMatchString === null) {
                traceMsg(
                    'No program match string supplied for ' + thisPlacementGroup
                );
            } else {
                let logProgramName =
                    logEntry.getCellValueAsString('Program Name');
                traceMsg('Log entry Program Name: ', logProgramName);
                if (logProgramName.search(programMatchString) >= 0) {
                    debugMsg(
                        aPlacementGroup.getCellValue('Placement Group') +
                            '  Match on Program Name:' +
                            logProgramName +
                            ' programMatchString:' +
                            programMatchString
                    );
                } else {
                    debugMsg(
                        'Failed to match on Program name for ' + placementInfo
                    );
                    continue PlacementGroups;
                }
            }

            // Check for a match on Program TEMPLATE Name
            let programTemplateMatchString = aPlacementGroup.getCellValue(
                'Program Template Match'
            );
            traceMsg(
                'programTemplateMatchString: ',
                programTemplateMatchString
            );
            if (programTemplateMatchString === null) {
                traceMsg('No template match string supplied');
            } else {
                let logProgramTemplateName =
                    logEntry.getCellValueAsString('Program Template');
                traceMsg(
                    'Log entry Program Template Name: ',
                    logProgramTemplateName
                );
                if (
                    logProgramTemplateName.search(programTemplateMatchString) >=
                    0
                ) {
                    debugMsg(
                        aPlacementGroup.getCellValue('Placement Group') +
                            '  Match on Program Template Name:' +
                            logProgramTemplateName +
                            ' programTemplateMatchString:' +
                            programTemplateMatchString
                    );
                } else {
                    debugMsg(
                        'Failed to match on Program name for' + placementInfo
                    );
                    continue PlacementGroups;
                }
            }

            // Check that copy can be placed on the DOW (Day Of Week) of this log
            let logEntryDow = logEntry.getCellValueAsString('DOW');
            let copyGroupDow =
                aPlacementGroup.getCellValueAsString('Days to Place');
            traceMsg('Log entry DOW', logEntryDow);
            if (copyGroupDow === '') {
                copyGroupDow = 'Mon/Tue/Wed/Thu/Fri/Sat/Sun';
            }
            traceMsg('Placement Group DOW Affinity', copyGroupDow);
            if (copyGroupDow.search(logEntryDow) >= 0) {
                copyGroupDowAffinityMatch = true;
                matchingCopyGroup = aPlacementGroup;
                traceMsg(
                    'DOW Affinity match ',
                    matchingCopyGroup.getCellValueAsString('Placement Group')
                );
            } else {
                debugMsg('NO DOW Affinity match for' + placementInfo);
                placementFailReason[placementIndex] = 'Day of week fail';
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

            includedMinimumTod =
                aPlacementGroup.getCellValue('Start Including');
            includedMaximumTod = aPlacementGroup.getCellValue('Stop Including');
            excludedMinimumTod =
                aPlacementGroup.getCellValue('Start Excluding');
            excludedMaximumTod = aPlacementGroup.getCellValue('Stop Excluding');
            traceMsg(
                'Checking TOD for group ',
                matchingCopyGroup.getCellValueAsString('Placement Group')
            );
            traceMsg(
                'Checking TOD for Entry at ',
                logEntry.getCellValue('Log Entry Time Str')
            );
            traceMsg('Checking logEntryStart ', logEntryStart);

            if (includedMinimumTod !== null) {
                traceMsg('Included MinimumTod', convertHMS(includedMinimumTod));

                incCount++;
            } else {
                includedMinimumTod = 0;
                traceMsg('Inc Min null');
            }
            if (includedMaximumTod !== null) {
                traceMsg('Included MaximumTod', convertHMS(includedMaximumTod));
                incCount++;
            } else {
                includedMaximumTod = 83110;
                traceMsg('Inc Max null');
            }
            if (excludedMaximumTod !== null) {
                traceMsg('Excluded MaximumTod', convertHMS(excludedMaximumTod));
                exCount++;
            } else {
                excludedMaximumTod = -1;
                traceMsg('Ex Max null');
            }
            if (excludedMinimumTod !== null) {
                traceMsg('Excluded MinimumTod', convertHMS(excludedMinimumTod));
                exCount++;
            } else {
                excludedMinimumTod = -1;
                traceMsg('Ex Min null');
            }
            if (exCount === 0 && incCount === 0) {
                traceMsg('No TOD Constraints');
                todOK = true;
            } else {
                if (incCount != 0 && exCount != 0) {
                    errorMsg(
                        'Both Time of Day Include and Exclude paramters present.  Ignoring Include paramters for' +
                            placementInfo
                    );
                }
                if (excludedMaximumTod != -1 || excludedMinimumTod != -1) {
                    traceMsg('TOD Exclusions');
                    if (excludedMaximumTod === -1) excludedMaximumTod = 83110;
                    if (excludedMinimumTod === -1) excludedMinimumTod = 0;
                    if (
                        logEntryStart >= excludedMaximumTod ||
                        logEntryStart <= excludedMinimumTod
                    ) {
                        todOK = true;
                    } else {
                        traceMsg('TOD check failed');
                    }
                } else {
                    traceMsg('TOD INclusions');
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
            traceMsg('TOD check AOK');

            // Check that this group has not exceeded its max placements or was too recently placed

            let minimumPlacementInterval = matchingCopyGroup.getCellValue(
                'Minimum Placement Interval'
            );
            if (minimumPlacementInterval === null) minimumPlacementInterval = 0;
            let placementMax =
                matchingCopyGroup.getCellValue('Maximum Placements');
            if (placementMax === null) placementMax = Number.POSITIVE_INFINITY;
            let groupLastPlaced = -1;
            let groupLastPlacedIndex = 0;
            let groupLastPlacedRecord = 0;
            let groupPlacementCount = 0;

            traceMsg(
                'Minimum Placement Interval for group: ' +
                    matchingCopyGroup.getCellValueAsString('Placement Group'),
                minimumPlacementInterval
            );
            traceMsg(
                'Max placements for group: ' +
                    matchingCopyGroup.getCellValueAsString('Placement Group'),
                placementMax
            );

            // Find the entry for the current placement group in the copyGroupLastPlacedArray
            for (let lastPlacedEntry of copyGroupLastPlacedArray) {
                // traceMsg("groupLastPlacedIndex in loop", groupLastPlacedIndex);
                if (lastPlacedEntry[lpaGroupRecordIdx] === matchingCopyGroup) {
                    groupLastPlacedRecord = lastPlacedEntry[lpaGroupRecordIdx];
                    groupLastPlaced = lastPlacedEntry[lpaGroupupdateIdx];
                    groupPlacementCount = lastPlacedEntry[lpaPlacements];
                    traceMsg(
                        matchingCopyGroup.getCellValueAsString(
                            'Placement Group'
                        ) +
                            ' groupLastPlaced: ' +
                            convertHMS(groupLastPlaced)
                    );
                    break;
                }
                groupLastPlacedIndex++;
            }
            if (groupLastPlacedRecord === 0) {
                errorMsg(
                    "Internal logic error.  Can't locate last placed pair for ",
                    matchingCopyGroup.getCellValueAsString('Placement Group')
                );
                return;
            }
            debugMsg(
                'Matching Copy group ' +
                    matchingCopyGroup.getCellValueAsString('Placement Group') +
                    ' last placed at: ' +
                    convertHMS(groupLastPlaced)
            );
            traceMsg('Matching groupLastPlacedIndex', groupLastPlacedIndex);
            traceMsg('groupLastPlaced', groupLastPlaced);
            traceMsg('matchingCopyGroup', matchingCopyGroup);
            traceMsg('minimumPlacementInterval', minimumPlacementInterval);
            traceMsg('logEntryStart', logEntryStart);
            traceMsg(
                'minimumPlacementIntervalMatch',
                minimumPlacementIntervalMatch
            );

            // Check that group was not used in the last 'Minimum Placement Interval'

            if (
                groupLastPlaced <= -1 ||
                logEntryStart - groupLastPlaced >= minimumPlacementInterval
            ) {
                minimumPlacementIntervalMatch = true;
                traceMsg(
                    'Interval check AOK for ',
                    matchingCopyGroup.getCellValueAsString('Placement Group') +
                        ' at time: ' +
                        logEntry.getCellValue('Log Entry Time Str')
                );
            } else {
                debugMsg('Failed interval check for' + placementInfo);
                continue PlacementGroups;
            }

            // Check prior placements to be sure we don't exceed maximum placements

            if (groupPlacementCount < placementMax) {
                traceMsg(
                    'Max Placements check AOK for ',
                    matchingCopyGroup.getCellValueAsString('Placement Group')
                );
                debugMsg(placementInfo + 'passed all rules.');
            } else {
                debugMsg('Failed max placements check' + placementInfo);
                continue PlacementGroups;
            }

            // For this group check if any Item's Copy Type matches the log entry's required type
            let copyTypeItem = 0;
            copyItemPointers = matchingCopyGroup.getCellValue('Copy Items');
            traceMsg('copyItemPointers', copyItemPointers);
            traceMsg(
                'Checking Copy Type of items in group ',
                matchingCopyGroup.getCellValueAsString('Placement Group')
            );

            // Use the list of copy items in the current group record to search thru all
            // copy item records that are in the current group.  For each copy record
            // in the current group, check if its copy type matches the current log entry's
            // required copy type.
            let itemCopyTypeMatch = false;

            ItemTypeCheck: for (let copyPointer of copyItemPointers) {
                traceMsg('Copy Item Loop', copyPointer.name);
                traceMsg('Copy Item id', copyPointer.id);
                for (let copyRecord of copyItems.records) {
                    if (copyPointer.id === copyRecord.id) {
                        if (
                            logEntryType.search(
                                copyRecord.getCellValueAsString('Copy Type')
                            ) >= 0
                        ) {
                            let matchPair = [];
                            // We have an item that can be placed.  Add it to our candidate list.
                            debugMsg(
                                'Matching Copy Name',
                                copyRecord.getCellValueAsString('Copy Name')
                            );
                            debugMsg(
                                'Matching Copy Type',
                                copyRecord.getCellValueAsString('Copy Type')
                            );
                            debugMsg('logEntryType', logEntryType);
                            // Copy ordered by priority.  The first matching copy is the highest priority match.
                            if (placementPriority === -1) {
                                placementPriority =
                                    matchingCopyGroup.getCellValue(
                                        'Placement Order'
                                    );
                            }
                            // If the priority of this placement group is not the same as the placementPriority then
                            // its lower priority; skip it.
                            if (
                                matchingCopyGroup.getCellValue(
                                    'Placement Order'
                                ) != placementPriority
                            ) {
                                debugMsg(
                                    'Placement priority too low for placement group',
                                    +placementInfo
                                );
                                continue PlacementGroups;
                            }
                            copyTypeItem = copyRecord;
                            itemCopyTypeMatch = true;
                            matchPair.push(matchingCopyGroup, copyTypeItem);
                            placementCandidates.push(matchPair);
                            debugMsg(
                                'placementCandidates',
                                placementCandidates
                            );
                            continue ItemTypeCheck;
                        }
                    }
                }
            }
            if (itemCopyTypeMatch) {
                debugMsg(
                    'For' +
                        placementInfo +
                        'Copy Type match found' +
                        copyTypeItem.getCellValueAsString('Copy Type')
                );
            } else {
                debugMsg('Item Type Mismatch for' + placementInfo);
            }
        } // End of PlacementGroups Loop

        /*
        We now have a list of all copy that could potentially be placed in the current log entry.
        Find the copy item in the placementCandidates structure that was least recently placed. 
        If we place that item then we'll wind up rotating placement groups and itmes so that we evenly
        distribute copy throughout the broadcast day.
        */

        if (placementCandidates.length > 0) {
            debugMsg('Found placement Candidates', placementCandidates);
        } else {
            traceMsg('No hits for this log entry');
            base.getTable('Program Log').updateRecordAsync(logEntry.id, {
                'Copy Placement Status': 'Unable to Place Copy',
            });
            await waitBetweenUpdates();
            if (!optionalEntry) {
                errorMsg(
                    'Was unable to place any copy for Placeholder at ',
                    logEntry.getCellValue('Log Entry Time Str')
                );
            }
            continue LogEntries;
        }

        //            printLastPlacedArray (copyGroupLastPlacedArray);

        // Select a placement gourp candidate that has not been placed yet.
        // If all candidates have already been placed, select the one least recently placed.
        let oldestPlacementTime = Number.POSITIVE_INFINITY;
        let oldestGroupIdx = -1;
        debugMsg(
            '===== Select oldest placement group candidate for ',
            logInfoString
        );
        for (let placementEntry of placementCandidates) {
            // iterate over placments candidates
            let placementGroup = placementEntry[0];
            traceMsg('placementGroup', placementGroup);
            let groupIndex = 0;
            for (let lastPlacedEntry of copyGroupLastPlacedArray) {
                // Iterate over last placed groups
                let lastPlacedGroupRecord = lastPlacedEntry[lpaGroupRecordIdx];
                let lastPlacedGroupTime = lastPlacedEntry[lpaGroupupdateIdx];
                if (placementGroup === lastPlacedGroupRecord) {
                    if (lastPlacedGroupTime < oldestPlacementTime) {
                        traceMsg('new oldest');
                        traceMsg('oldestPlacementTime', oldestPlacementTime);
                        traceMsg('lastPlacedEntry', lastPlacedEntry);
                        traceMsg(
                            'lastPlacedGroupRecord',
                            lastPlacedGroupRecord
                        );
                        traceMsg(
                            'group Name',
                            lastPlacedGroupRecord.getCellValueAsString(
                                'Placement Group'
                            )
                        );
                        oldestPlacementTime = lastPlacedGroupTime;
                        oldestGroupIdx = groupIndex;
                        traceMsg('oldestGroupIdx', oldestGroupIdx);
                    }
                }
                groupIndex++;
            }
        }
        traceMsg('oldestGroupIdx', oldestGroupIdx);
        debugMsg('matchingCopyGroup', matchingCopyGroup);
        matchingCopyGroup =
            copyGroupLastPlacedArray[oldestGroupIdx][lpaGroupRecordIdx];

        // Now search all placement candidates with a matching placement group and find the
        // candidate with an item whose placed time is oldest.
        let oldestItemIdx = 0;
        oldestPlacementTime = Number.POSITIVE_INFINITY;
        {
            let lastPlacedEntry = copyGroupLastPlacedArray[oldestGroupIdx];
            let lastPlacedGroupRecord = lastPlacedEntry[lpaGroupRecordIdx];
            let lastPlacedGroupTime = lastPlacedEntry[lpaGroupupdateIdx];
            let lastPlacedItemRecords = lastPlacedEntry[lpaItemRecordsIdx];
            let lastPlacedItemTimes = lastPlacedEntry[lpacopyItemUpdatesIdx];
            for (let placementEntry of placementCandidates) {
                // iterate over placments candidates
                let placementGroup = placementEntry[0];
                let placementItem = placementEntry[1];
                if (placementGroup === matchingCopyGroup) {
                    let itemIndex = 0;
                    for (let itemRecord of lastPlacedItemRecords) {
                        // Iterate over last placed items
                        if (placementItem === itemRecord) {
                            // Only look at items that match placement item
                            if (
                                lastPlacedItemTimes[itemIndex] <
                                oldestPlacementTime
                            ) {
                                traceMsg('new oldest');
                                traceMsg(
                                    'oldestPlacementTime',
                                    oldestPlacementTime
                                );
                                traceMsg(
                                    'lastPlacedItemTimes[itemIndex]',
                                    lastPlacedItemTimes[itemIndex]
                                );
                                traceMsg('lastPlacedEntry', lastPlacedEntry);
                                traceMsg(
                                    'lastPlacedGroupRecord',
                                    lastPlacedGroupRecord
                                );
                                traceMsg(
                                    'group Name',
                                    lastPlacedGroupRecord.getCellValueAsString(
                                        'Placement Group'
                                    )
                                );
                                traceMsg(
                                    'Copy Item',
                                    itemRecord.getCellValueAsString('Item')
                                );
                                traceMsg(
                                    'lastPlacedItemRecords',
                                    lastPlacedItemRecords
                                );
                                oldestPlacementTime =
                                    lastPlacedItemTimes[itemIndex];
                                oldestItemIdx = itemIndex;
                                traceMsg('oldestGroupIdx', oldestGroupIdx);
                                traceMsg('itemIndex', itemIndex);
                            }
                        }
                        itemIndex++;
                    }
                }
            }
        }
        matchingItem =
            copyGroupLastPlacedArray[oldestGroupIdx][lpaItemRecordsIdx][
                oldestItemIdx
            ];

        // We have the copy item we want to place in the current log entry.  Update the 'last placed' time
        // for both placement group and copy entry.
        traceMsg(
            'copyGroupLastPlacedArray prior to update',
            copyGroupLastPlacedArray
        );
        traceMsg('oldestItemIdx', oldestItemIdx);
        copyGroupLastPlacedArray[oldestGroupIdx][lpaGroupupdateIdx] =
            logEntryStart;
        copyGroupLastPlacedArray[oldestGroupIdx][lpacopyItemUpdatesIdx][
            oldestItemIdx
        ] = logEntryStart;
        copyGroupLastPlacedArray[oldestGroupIdx][lpaPlacements]++;

        traceMsg('matchingCopyGroup', matchingCopyGroup);
        traceMsg('matchingItem', matchingItem);
        traceMsg('placementCandidates', placementCandidates);
        // traceMsg("copyGroupLastPlacedArray", copyGroupLastPlacedArray);

        // Update copy start if not start of sequence
        if (
            logEntry.getCellValueAsString('Program Name') === lastProgram &&
            logEntry.getCellValueAsString('Break Name') === lastBreak
        ) {
            adjustedStart = lastCopyStart + lastCopyDuration;
            traceMsg('Adjusted start to ', adjustedStart);
            traceMsg('Cnt start ', logEntry.getCellValue('Copy Start'));
        } else {
            adjustedStart = logEntry.getCellValue('Copy Start');
            traceMsg('Adjusted kept at copy start ', adjustedStart);
        }

        // Place our matching copy in the log entry!
        debugMsg(
            'Copy will be placed from ' +
                matchingItem.getCellValueAsString('Copy Name') +
                '  Placement Group: ',
            matchingCopyGroup.getCellValueAsString('Placement Group')
        );
        traceMsg('Copy Placement Status', 'Copy Placed');
        traceMsg(
            'Copy Duration Secs',
            matchingItem.getCellValue('Copy Duration Secs')
        );
        traceMsg(
            'Playback Device',
            matchingItem.getCellValueAsString('Playback Device')
        );
        traceMsg('Track/URL', matchingItem.getCellValueAsString('Track/URL'));
        traceMsg('Script', matchingItem.getCellValueAsString('Script'));

        updatedLogRecords.push({
            id: logEntry.id,
            fields: {
                Copy: matchingItem.getCellValueAsString('Copy Name'),
                'Copy Placement Status': 'Copy Placed',
                'Included Types':
                    matchingItem.getCellValueAsString('Copy Type'),
                Dur: matchingItem.getCellValue('Copy Duration Secs'),
                'Placement Group':
                    matchingCopyGroup.getCellValue('Placement Group'),
                'Playback Device':
                    matchingItem.getCellValueAsString('Playback Device'),
                'Track/URL': matchingItem.getCellValueAsString('Track/URL'),
                Script: matchingItem.getCellValueAsString('Script'),
                'Copy Start': adjustedStart,
            },
        });

        // now update our state
        traceMsg('Copy (dur)', matchingItem.getCellValueAsString('Copy Name'));
        traceMsg('lastProgram', lastProgram);
        traceMsg('lastBreak', lastBreak);
        traceMsg('lastCopyDuration', lastCopyDuration);
        traceMsg('lastProgram', lastProgram);
        traceMsg('lastCopyStart', lastCopyStart);
        traceMsg('lastSequence', lastSequence);
        lastProgram = logEntry.getCellValueAsString('Program Name');
        lastBreak = logEntry.getCellValueAsString('Break Name');
        lastCopyDuration = matchingItem.getCellValue('Copy Duration Secs');
        lastCopyStart = adjustedStart;
        traceMsg('lastCopyDuration', lastCopyDuration);
        traceMsg(logEntry.getCellValueAsString('Break Name'));
        traceMsg(logEntry.getCellValueAsString('Copy Start'));
        traceMsg(logEntry.getCellValueAsString('Dur'));

        traceMsg('Copy placed for ' + logEntry.getCellValue('Sequence Start'));
        traceMsg(
            'copyGroupLastPlacedArray after placement',
            copyGroupLastPlacedArray
        );
        debugMsg(
            'Reached end of placement loop for ',
            +logEntry.getCellValue('Sequence Start')
        );
    } // end of log entry placement loop

    // Update the new program log table with copy placements
    output.markdown('### Updating Program Log table with copy placements');
    await waitBetweenUpdates();
    while (updatedLogRecords.length > 0) {
        await base
            .getTable('Program Log')
            .updateRecordsAsync(updatedLogRecords.slice(0, 15));
        updatedLogRecords = updatedLogRecords.slice(15);
        await waitBetweenUpdates();
    }
    output.markdown('# Program Log is Ready to print');

    // Print the Placement Array
    output.markdown('## Placement Data');
    printLastPlacedArray(copyGroupLastPlacedArray);

    // Print out a 'Date Fail list'
    output.markdown('## Placement Group Date Fail report');
    for (
        placementIndex = 0;
        placementIndex < placementFailGroup.length;
        ++placementIndex
    ) {
        if (placementFailReason[placementIndex].length > 0) {
            output.markdown(
                placementFailGroup[placementIndex] +
                    ': ' +
                    placementFailReason[placementIndex]
            );
        }
    }
    // Print out a 'bump list'
    output.markdown("## Placement Group 'bump report'");
    for (let lastPlacedEntry of copyGroupLastPlacedArray) {
        groupPlacementCount = lastPlacedEntry[lpaPlacements];
        groupLastPlacedRecord = lastPlacedEntry[lpaGroupRecordIdx];
        if (groupPlacementCount < lastPlacedEntry[lpaMinimumPlacements]) {
            if (
                !placementFailGroup.includes(
                    groupLastPlacedRecord.getCellValueAsString(
                        'Placement Group'
                    )
                )
            ) {
                output.markdown(
                    groupLastPlacedRecord.getCellValueAsString(
                        'Placement Group'
                    ) +
                        ': Minimum Placements: ' +
                        lastPlacedEntry[lpaMinimumPlacements] +
                        ' Actual Placements: ' +
                        groupPlacementCount
                );
            }
        }
    }
    debugMsg('copyGroupLastPlacedArray', copyGroupLastPlacedArray);
}

/*

    Support functions

*/
function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
    let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
}

function printLastPlacedArray(myCopyGroupLastPlacedArray) {
    const lpaGroupRecordIdx = 0, // Placement Group Record
        lpaGroupupdateIdx = 1, // Time Last Placed
        lpaMinimumPlacements = 2, // Minimum Required Placements
        lpaPlacements = 3, // Actual Placements so far
        lpaItemRecordsIdx = 4, // Copy records Array
        lpacopyItemUpdatesIdx = 5; // Copy records time last placed array

    output.markdown('============ Last Placed Info =======================');
    for (let lastPlacedEntry of myCopyGroupLastPlacedArray) {
        let thisGroup =
            lastPlacedEntry[lpaGroupRecordIdx].getCellValueAsString(
                'Placement Group'
            );
        let thisLastPlaced = lastPlacedEntry[lpaGroupupdateIdx];
        let thisMinimumPlacements = lastPlacedEntry[lpaMinimumPlacements];
        let thisPlacements = lastPlacedEntry[lpaPlacements];
        let thisItemRecords = lastPlacedEntry[lpaItemRecordsIdx];
        let thisCopyItemUpdates = lastPlacedEntry[lpacopyItemUpdatesIdx];
        if (thisLastPlaced < 0) {
            output.markdown(
                'Placed: . . . . ' +
                    '  Group: ' +
                    thisGroup +
                    ' Min: ' +
                    thisMinimumPlacements +
                    ' Act: ' +
                    thisPlacements
            );
        } else {
            output.markdown(
                'Placed: ' +
                    convertHMS(thisLastPlaced) +
                    '  Group: ' +
                    thisGroup +
                    ' Min: ' +
                    thisMinimumPlacements +
                    ' Act: ' +
                    thisPlacements
            );
        }
        for (var i = 0; i < thisItemRecords.length; ++i) {
            let thisItemUpdated = thisCopyItemUpdates[i];
            let thisItemRecord = thisItemRecords[i];
            if (thisItemUpdated < 0) {
                output.markdown(
                    '                    Item: . . . . ' +
                        ' Name: ' +
                        thisItemRecord.getCellValueAsString('Copy Name')
                );
            } else {
                output.markdown(
                    '                    Item: ' +
                        convertHMS(thisItemUpdated) +
                        ' Name: ' +
                        thisItemRecord.getCellValueAsString('Copy Name')
                );
            }
        }
    }
    output.markdown('=====================================================');
}

/*
  If the last Airtable update was less than 'intervalLiit' milliseconds ago, wait until it's time to update again.
*/

async function waitBetweenUpdates() {
    const intervalLimit = 1000;
    updateInterval = new Date().getTime() - lastUpdateTime;
    debugMsg('updateInterval: ' + updateInterval);
    if (updateInterval < intervalLimit) {
        await new Promise((resolve) =>
            setTimeout(resolve, intervalLimit - updateInterval)
        );
    }
    lastUpdateTime = new Date().getTime();
    //    await new Promise(resolve => setTimeout(resolve, 1100));
    //    debugMsg("Milliseconds updates: " + (new Date().getTime() - startTime));
}

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
        Main logic
    */

//     warnlvl = 1,     infolvl = 2,     debuglvl = 3,     tracelvl = 4; msglvl = infolvl;
// msglvl = debuglvl;

debugMsg('parametersRecord: ', parametersRecord);
output.markdown(
    'Trace Placement Group: ' +
        tracePlacementGroup +
        ' Trace Copy Item: ' +
        traceCopyItem +
        ' Trace Number: ' +
        traceLevel
);
await generateLog();

await placeCopy();
//
