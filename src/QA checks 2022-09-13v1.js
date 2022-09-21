// Placement Groups QA checks
CONCATENATE(
    SWITCH({Default Content Type},
        "Underwriting",
            CONCATENATE(
                IF(NOT(AND({Expiration Date},{Effective Date})),
                    "❌ Expiration and/or effective date is missing.\n",
                    ""),
                    IF(NOT(AND({Start Including},{Stop Including})),
                    "❌ Start and/or Stop Including fields are missing.\n",
                    ""),
                    IF(NOT(AND({Minimum Placements},{Maximum Placements})),
                        "❌ Minimum and/or Maximum Placements fields are missing.\n",
                        IF({Minimum Placements}>{Maximum Placements},
                            "❌ Minimum Placements is greater than Maximum Placements.\n",
                            "")
                    ),
                    IF(NOT({Minimum Placement Interval}),
                    "❌ Minimum placement interval is missing.\n",
                    ""),
                    IF(NOT({Underwriter}),
                    "❌ Underwriter field is missing.\n",
                    "")
            ),
    ""),

    IF(IS_BEFORE({Expiration Date},{Effective Date}),
        "❌ Expiration date is before effective date.\n",
        ""),

    IF({#Items}=0,
        "❌ This Placement Group contains no copy items.\n",
        ""),

    IF(NOT({Default Content Type}),
        "❌ Default content type is missing.\n",
        "")
)        



IF(LEN({QA Calculations})=0,
    "✅",   
    IF(IS_AFTER(TODAY(),{Expiration Date}),
    "✅",   
    {QA Calculations})
)

// Copy Items QA checks

CONCATENATE(
    IF({Placement Count} != 1,
        "❌ Placement count is not 1.\n",
        ""),

    IF(AND(NOT({Default Content Type}),NOT({Override Content Type})),
        "❌ Default and Override Content Type are both missing.\n",
        "")
)        

CONCATENATE(
    SWITCH({Default Content Type},
        "Underwriting",
            CONCATENATE(
                IF(NOT(AND({Expiration Date},{Effective Date})),
                    "❌ Expiration and/or effective date is missing.\n",
                    ""),
                    IF(NOT(AND({Start Including},{Stop Including})),
                    "❌ Start and/or Stop Including fields are missing.\n",
                    ""),
                    IF(NOT(AND({Minimum Placements},{Maximum Placements})),
                        "❌ Minimum and/or Maximum Placements fields are missing.\n",
                        IF({Minimum Placements}>{Maximum Placements},
                            "❌ Minimum Placements is greater than Maximum Placements.\n",
                            "")
                    ),
                    IF(NOT({Minimum Placement Interval}),
                    "❌ Minimum placement interval is missing.\n",
                    ""),
                    IF(NOT({Underwriter}),
                    "❌ Underwriter field is missing.\n",
                    "")
            ),
    ""),

    IF(IS_BEFORE({Expiration Date},{Effective Date}),
        "❌ Expiration date is before effective date.\n",
        ""),

    IF({#Items}=0,
        "❌ This Placement Group contains no copy items.\n",
        ""),

    IF(NOT({Default Content Type}),
        "❌ Default content type is missing.\n",
        "")
)        



IF(LEN({QA Calculations})=0,
    "✅",   
    IF(IS_AFTER(TODAY(),{Expiration Date}),
    "✅",   
    {QA Calculations})
)