IF(
    OR(
        {Programs Last modified time}, 
        {Category 1 Last Modified}, 
        {Category 2 Last Modified}, 
        {Playlist 1 Last Modified}, 
        {Playlist 2 Last Modified}, 
        {Event Template Last Modified}
    ), 
    DATETIME_PARSE(
        MAX(
        IF({Programs Last modified time}, VALUE(DATETIME_FORMAT({Programs Last modified time}, 'YYYYMMDDHHmm'))), 
        IF({Category 1 Last Modified}, VALUE(DATETIME_FORMAT({Category 1 Last Modified}, 'YYYYMMDDHHmm'))), 
        IF({Category 2 Last Modified}, VALUE(DATETIME_FORMAT({Category 2 Last Modified}, 'YYYYMMDDHHmm'))),
        IF({Playlist 1 Last Modified}, VALUE(DATETIME_FORMAT({Playlist 1 Last Modified}, 'YYYYMMDDHHmm'))), 
        IF({Playlist 2 Last Modified}, VALUE(DATETIME_FORMAT({Playlist 2 Last Modified}, 'YYYYMMDDHHmm'))), 
        IF({Event Template Last Modified}, VALUE(DATETIME_FORMAT({Event Template Last Modified}, 'YYYYMMDDHHmm')))
        ), 
        'YYYYMMDDHHmm'
    )
)



IF(
    OR(
        {Programs Last modified time}, 
        {Category 1 Last Modified}, 
        {Category 2 Last Modified}, 
        {Playlist 1 Last Modified}, 
        {Playlist 2 Last Modified}, 
        {Event Template Last Modified}, 
        {Date7}, 
        {Date8}, 
        {Date9}), 
    DATETIME_PARSE(
        MAX(
        IF({Programs Last modified time}, VALUE(DATETIME_FORMAT({Programs Last modified time}, 'YYYYMMDD'))), 
        IF({Category 1 Last Modified}, VALUE(DATETIME_FORMAT({Category 1 Last Modified}, 'YYYYMMDD'))), 
        IF({Category 2 Last Modified}, VALUE(DATETIME_FORMAT({Category 2 Last Modified}, 'YYYYMMDD'))),
        IF({Playlist 1 Last Modified}, VALUE(DATETIME_FORMAT({Playlist 1 Last Modified}, 'YYYYMMDD'))), 
        IF({Playlist 2 Last Modified}, VALUE(DATETIME_FORMAT({Playlist 2 Last Modified}, 'YYYYMMDD'))), 
        IF({Event Template Last Modified}, VALUE(DATETIME_FORMAT({Event Template Last Modified}, 'YYYYMMDD'))),
        IF({Date7}, VALUE(DATETIME_FORMAT({Date7}, 'YYYYMMDD'))), 
        IF({Date8}, VALUE(DATETIME_FORMAT({Date8}, 'YYYYMMDD'))), 
        IF({Date9}, VALUE(DATETIME_FORMAT({Date9}, 'YYYYMMDD')))
        ), 
        'YYYYMMDD'
    )
)