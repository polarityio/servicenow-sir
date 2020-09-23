# How to Find Custom Fields for Service Now

1. To find a custom field to search by Service Now for either the incident or asset tables you must first go to the table in the Service Now Dashboard.

<img width="800" alt="Go to Incident Table Image" src="./assets/dashboard-go-to-table.png">

2. Once you find the table click on the gear icon in the upper left of that table.

<img width="500" alt="Click on Gear Icon in Upper Left" src="./assets/click-on-gear-icon.png">

3. Find the field you want to search by and move it over to the selected section.

<img width="600" alt="Select the Field you Want to Search By" src="./assets/select-the-field-you-want-to-search-by.png">

4. Find that new column in the table and sort by it in a way that allows you to see an example of a row with a value in that column.

<img width="500" alt="Find the Field you want to seach by in the table and sort by it" src="./assets/find-field-and-sort-by.png">

5. Copy that example value(`CTRL/CMD + C`), then right click on the header of that new column and select the `Show XML` option.

<img width="600" alt="Copy example value and right click on header of table then click Show XML" src="./assets/right-click-on-header-and-show-xml.png">

6. Use search `CTRL/CMD + F` and paste your example value you copied in the previous step into the search field (`CTRL/CMD + V`) and hit `Enter`.  The key you find to the left of your example value will be the key you will use in the Custom Fields Option in your Polarity Dashboard for your Service Now Integration.

<img width="700" alt="Search example field value in popup and copy key you find" src="./assets/search-field-in-popup.png">

