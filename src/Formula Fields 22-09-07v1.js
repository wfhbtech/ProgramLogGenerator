// Item

"("& ID &") " & LEFT(Task ,30) &"\n"
& LEFT(Project,30) & " #"& Seq & "\n " 
& {Assigned to} &" ^" & Area & "\n " 
& Notes

// Computed Start
IF({Started On},
    {Started On},
    IF({Computed Constrained Start},
        DATEADD({Computed Constrained Start},1,
            'days'
            ),
        TODAY()
    )
)

// {Computed End}
//  If there are dependencies, this is the date the task will complete
//  based on the maximum of the dependencies, else it's the same as
//  the task completion w.o. dependencies
IF({Completed On},
    {Completed On},
    DATEADD({Computed Start},
            {Days},
            'days'
            )
)

// {Days Late}
IF({Due By},
    IF(IS_AFTER({Computed Completion},{Due By}),
    	DATETIME_DIFF({Computed Completion},{Due By},'days'),
        0),
    0
)

// Status
IF({Completed On},
    "Completed",
    IF({Blocked} > 0,
        "Blocked",
        IF({Days Late}>0,
            "Late",
            IF({Started On},
                "In Progress",
                IF({Assigned to},
                    "Asssigned",
                    "Needs Assignment"
                )
            )
        )
    )
)

// {Task Completion w.o. Dependencies}
//  Date task will complete if there are no dependencies
//  Not that useful unless we have both a start date and effort
IF({Started On},
    IF({Days},
        DATEADD({Started On},{Days},'days'),
        {Started On}
    ),
    IF({Computed Constrained Start},
        IF({Days},
            DATEADD({Computed Constrained Start},{Days},'days'),
            {Computed Constrained Start}
        ),
        TODAY()
        )
)




// (Do Next)
//  A weighting for which task should be done next
{Time Based Score}+{Days Behind}

// {Time Based Score}
{Effort Behind}+({Urgency Score}*{BehindMax})

