"""Editorial answers for supplied worksheets. Choice order: correct first, then distractors.
Existing lettered choices use their original answer letters instead.
"""
MODULES = {
 1: 'Modernized work experience', 2: 'Instance configuration',
 3: 'Application configuration', 4: 'Data management', 5: 'Self-service',
 6: 'Productivity', 7: 'Utilities', 8: 'Instance security',
}
# number | answer(s) or four choices separated by ~ | explanation
WORKSHEETS = {
'exploring': '''
1|Production instance~Development instance~Test instance~Personal developer instance|Production serves business users. This scenario assumes those users are working in production.
2|Baseline instance~Cloned instance~Customized instance~Retired instance|Baseline describes the initial installed platform before organization-specific changes.
3|Multi-instance architecture~One shared application instance for every customer~Peer-to-peer architecture~A browser-only database|ServiceNow separates customer instances rather than placing every customer into one shared instance.
4|Configuration~An instance clone~A database restore~User impersonation|Adding a field with platform tools is a configuration task.
5|Capture the supported configuration in an update set and retrieve, preview, resolve issues, and commit it on the target~Copy browser preferences to production~Export the user table only~Activate impersonation in production|Update sets package supported configuration changes; test them before production deployment.
6|Application scope~A favorite~A list filter~A report schedule|Scope supplies a namespace and application access boundaries.
7|AD|The two script-based changes add custom logic; layouts, dashboards, and branding use configuration tools.
8|Plugins~User sessions~List filters~Import set rows|Plugins enable additional platform capabilities and applications, subject to availability and entitlement.
9|Application scope selector~Global search icon~List filter icon~Notification bell|The application scope selector identifies and changes the current development scope for authorized users.
10|A separately accessible ServiceNow environment with its own application configuration and database~A single row in the User table~A browser tab shared by all customers~A type of catalog variable|An instance is an environment such as development, test, or production.
11|All menu / Application Navigator~Transform Map~Event Registry~Import Set Loader|Navigation menus expose applications and their modules according to access.
12|Favorites for the table lists~New table extensions~New ACLs for each visit~Duplicate copies of the tables|Favorites provide shortcuts to frequently used destinations.
''',
'foundations': '''
1|Create or modify access control rules using security_admin~Change a personal list layout~Open an incident assigned to you~Add a navigation favorite|ACL administration requires elevation to security_admin when that role is available to the administrator.
2|Records~Dashboards~Applications~Update sets|Rows in a table are records; fields store individual values.
3|admin~itil~catalog_admin~approver_user|The admin role has broad administration rights; security_admin elevation covers protected security administration.
4|Impersonate Max and inspect his effective roles and access~Delete the application~Give every user admin~Disable all table ACLs|Impersonation helps reproduce access problems using the affected user's permissions.
5|User [sys_user]~Group [sys_user_group]~Role [sys_user_role]~Task [task]|User records are stored in sys_user.
6|Role requirements on the application menu and module~Only the menu color~Only the user's browser language~The number of favorites a user has|Menu and module role requirements govern navigation visibility; data access is separately enforced by ACLs.
7|Assign the role to an appropriate group and add Sydney to that group~Give Sydney admin~Create a duplicate user~Make the role a favorite|Group-based role assignment simplifies consistent access management.
8|BCE|Roles may be granted to users or groups, contain other roles, and are stored in sys_user_role.
9|ABCEF|These are the five persona categories used by this training question; IT Manager is a job title rather than one of those categories.
10|Group [sys_user_group]~User [sys_user]~Role [sys_user_role]~Group Member [sys_user_grmember]|sys_user_group stores group definitions; sys_user_grmember stores group memberships.
11|User menu~Filter breadcrumb~Related list~Schema map|The user menu exposes session and preference actions according to the user's permissions.
12|Select End Impersonation in the user menu~Delete the impersonated user~Commit an update set~Clear the incident list|End Impersonation restores the original administrator's session identity.
13|In the upper-right area of the navigation header~In every list footer~Inside the import staging table~At the bottom of the system dictionary|The profile/user control is in the navigation header in the standard interface.
14|ACE|Catalogs, lists, and forms are common interfaces for requesting services and working with records.
15|The browser sends a request, the server processes it, and the server returns a response~The browser directly edits the database files~The database sends every table to every browser continuously~The client processes all server business rules locally|ServiceNow uses a client-server request-response interaction.
16|BC|The classic My Company branding settings include banner image and banner text; other theme settings use separate configuration.
17|ACDE|These user menu actions depend on the roles and capabilities available to the current user.
18|Software as a Service (SaaS)~Desktop-only software licensing~Peer-to-peer file sharing~Customer-managed database hardware only|ServiceNow is delivered as a cloud service.
19|Use the portal's Service Catalog or catalog navigation link~Open the ACL editor~Open the import set staging table~Activate the update set picker|Portal catalog navigation lets requesters browse and order available offerings.
''',
'building': '''
1|ABD|Form Builder, Form Design, and Form Layout configure forms; List Layout configures lists.
2|ACE|UI actions can appear as buttons, links, or context menu entries.
3|Table [sys_db_object]~User [sys_user]~Dictionary [sys_dictionary]~Task [task]|sys_db_object stores table definitions; sys_dictionary stores dictionary definitions for tables and fields.
4|AC|Tables and Tables & Columns are table administration modules.
5|ABF|Fields can be added through Form Design, dictionary entries on a table, or Form Layout from a form.
6|A list~A single-record form~A role~A field label|A list presents multiple records from a table.
7|The field selector~The free-text value in every condition~The report title~The list's record count|The field selector offers fields available for the selected table and user context.
8|My Lists in the workspace list area~The Event Registry~Retrieved Update Sets~The ACL debugger|Personal workspace lists appear in the workspace's My Lists area when supported by that workspace.
9|List configuration defines the shared layout for a view; personalization changes the current user's layout~Both always change every user's layout~Personalization deletes columns from the database~Configuration can only change sort direction|Personal preferences can override the shared list layout for that user.
10|Create an active application menu and an active List of Records module pointing to the employee table with appropriate roles~Create only a user preference~Create only a report schedule~Create only an email notification|A menu groups modules; a List of Records module opens records from the configured table.
11|Use the list editor on an editable cell~Edit the table's sys_id~Change the instance URL~Export and delete the table|List editing changes permitted field values without opening each form.
12|BCF|Tables contain records and each record contains field values.
13|The filter breadcrumbs above the list~The browser password store~The update set state field~The application scope name|Breadcrumbs display the active list filter and allow navigation through its conditions.
14|Choice field~Journal field~Boolean field~Date field|A choice field presents predefined selectable values.
15|Create form views and appropriate view rules~Create duplicate production databases~Use an update set per user~Replace the form with an import set|Views can present different layouts. Use ACLs as well when fields must be secured, since views alone are not security controls.
16|Filter Capacity greater than 10 and run the filter~Filter Capacity less than 10~Filter Capacity is 10~Sort Capacity ascending without a filter|A greater-than comparison excludes rooms with capacity 10 or less.
17|BCE|A condition compares a field to a value using an operator.
18|One record~All table records~Exactly ten records~One table definition and all its rows|A standard form displays a single record.
19|Right-click a Type cell containing Cat and select Filter Out~Select Show Matching on Cat~Sort Type ascending~Remove Type from the list layout|Filter Out adds a condition excluding the selected value.
20|BC|A field context menu is opened on the form field and includes dictionary and label configuration for authorized users.
21|ACD|Standard system fields include sys_updated_on, sys_created_by, and sys_id.
22|An asterisk (*) in list text search~A dollar sign ($)~An ampersand (&)~A colon (:)|A leading asterisk in standard list text search performs a contains search; condition-builder operators are a separate interface.
23|AE|The table creation wizard can create an application menu and plural-label module when its module creation options are selected.
''',
'self_service': '''
1|Service Catalog~System Dictionary~Event Registry~Schema Map|The Service Catalog presents orderable products and services.
2|Configure Cannot Read and Cannot Contribute user criteria on the knowledge base~Hide the knowledge navigation favorite~Change the article font~Remove all catalog variables|Knowledge user criteria control reading and contribution; exclusion criteria take precedence over inclusion criteria.
3|Catalog Builder~Schema Map~ACL Debugger~Number Maintenance|Catalog Builder provides a guided interface for creating catalog offerings.
4|ACDE|Commenting, marking an article unhelpful, flagging it, and rating it can all provide feedback when enabled.
5|One requested catalog item within an order~The entire catalog~Every user's shopping cart~A configuration item relationship|A requested item is linked to its parent request and can have fulfillment tasks.
6|BCF|Multiple Choice, Reference, and Check box are catalog variable types. Masked is the type used for password-like input.
7|The Flow Designer help panel~Number Maintenance~The CI Class Manager~The impersonation dialog|The help panel includes guidance about flows, data, and spokes.
8|The article is still a draft and has not been published~Every article requires a custom ACL before saving~The title must equal the author's name~Knowledge articles are stored only in update sets|Submitting an article is not the same as publishing it to the intended audience.
9|Give Manager a lower Order value than the other variables~Give Manager the longest label~Rename the request number~Make every variable read-only|Variable order values control display sequence, with lower values appearing first.
10|A catalog interface that creates a record in a target table~A report that exports every table~A process that clones an instance~A script that always creates a requested item|A record producer collects catalog-style input to create a record such as an incident.
11|BCE|The training classification is record-based, scheduled, and application-based flow triggers.
12|ABD|A request groups the order and contains one or more requested items.
13|Catalog items~User sessions~Access control operations~Update set collisions|Catalog items represent the individual products or services offered through a catalog.
14|Ask for Approval~Create a favorite~Delete Record~Log out|Ask for Approval requests approval and exposes an outcome that later flow logic can evaluate.
15|An order guide~An ACL wildcard~A transform map~A list personalization|Order guides guide requesters through related catalog items in one request.
16|AB|User criteria govern availability in Knowledge Management and Service Catalog. They do not replace general table ACLs.
17|Employee Center~System Dictionary~Update Set Preview~CI Class Manager|Employee Center is the employee self-service entry point when deployed and configured for onboarding.
18|ACD|Flows support low-code automation, reusable actions, and integration capabilities with the required components installed.
19|BD|A trigger starts a flow and actions perform the work.
20|A stage~A sys_id~An application scope~A role inheritance chain|Stages communicate progress through fulfillment or another process.
21|In action outputs, available to later steps through data pills~Only in the user's favorites~In table labels~In the application menu name|Action outputs make results available to subsequent flow steps.
22|Add catalog variables for color and storage size~Create a new instance per color~Add ACL operations named after colors~Use the record number as a storage field|Variables collect request-specific information on a catalog item.
23|Spokes~Views~ACLs~Breadcrumbs|Spokes package integration actions and related automation content for a system or use case.
24|Design end-to-end processes using stages and activities that can be presented as playbooks~Replace all table ACLs~Create database backups~Edit browser cookies|Process Automation Designer models cross-enterprise processes and their activities.
25|ACF|Virtual Agent handles routine conversational requests and can reduce demand on support staff.
26|Use Undo in the flow editor~Delete the production instance~Change the flow's sys_id~Reinstall the platform|Undo reverses an eligible recent editor change.
28|BD|HTML is standard; Wiki article support depends on the Knowledge Management Wiki Support plugin.
29|My Groups Work~My Work~All Update Sets~My Notification Preferences|My Groups Work lists work for the user's groups, typically including tasks not yet assigned to an individual.
''',
'manage': '''
2|BCD|Task is a baseline core table, a base table that does not extend another table, and a parent of task-derived tables.
3|A|Access controls enforce permissions on operations against records and fields.
4|C|Schema Map displays table relationships, including references and extensions.
5|DEF|A table contains rows (records) and columns (fields).
6|System Definition > Number Maintenance~System Logs > Events~Service Catalog > Order Guides~User Administration > Groups|Number Maintenance manages number prefixes and counters for numbered tables.
7|Reference field~Choice field~Journal field~Boolean field|Reference fields point to records in another table and can offer lookup and preview controls.
8|ACE|These identify the label, internal field name, and stored value. Maximum length is a separate field definition property.
10|No access to the protected table's records or their fields for that operation~Access to every field~Access to the field despite failing table access~Automatic admin access|For a field operation, the user must pass applicable table-level and field-level access checks.
11|Uncheck security_admin under Elevate Roles, or log out~Delete the admin role definition~Close only the current record~Mark the update set Complete|Elevated privileges are session-based and can be removed without deleting assigned roles.
12|A base table does not extend another table; a core table is supplied with the platform~A base table is always custom and a core table is always temporary~A core table cannot contain records~Base and core both mean child table|Base describes inheritance position; core describes origin in the baseline platform.
14|BCDF|When Create access controls is enabled, the table wizard creates create, read, write, and delete rules.
15|The sys_id field~The display label~The record's current row position~The assigned user's name|sys_id is the record's unique 32-character identifier.
16|ABE|Classic ACL permission checks can include roles, a condition, and a script.
17|All fields covered by pets.* except name, assuming no other ACL grants name access~Only name~No fields despite passing pets.-None-~Every field including name automatically|The more specific pets.name rule masks the wildcard for name; Kim must satisfy the applicable specific rule.
18|Table-level access is checked before field-level access, using applicable specific, inherited, and wildcard rules~Field-level access always bypasses table rules~Only wildcard rules are evaluated~The newest ACL is the only ACL checked|Passing a field rule cannot compensate for failing table access.
19|A child (extended) table~An unrelated staging table~A user preference~A role container|A table extending another is its child and inherits fields from the parent.
20|Import Sets with a transform map~Only update sets~Only list personalization~Only notification templates|Import sets stage external data and transform maps move it into target tables.
21|Transform map~Schema map~Form view~Order guide|A transform map defines source-to-target table and field mappings.
22|To match incoming rows with existing target records so they can be updated instead of duplicated~To make every field read-only~To convert every value to a sys_id~To export all user roles|Coalesce identifies matches; it is not a database uniqueness constraint.
23|CDF|cmdb, cmdb_ci, and cmdb_rel_ci are foundational CMDB tables, among other CMDB tables and subclasses.
25|Dependency Views~List Layout~Number Maintenance~Notification Preferences|Dependency Views visualize CI relationships and support impact analysis.
27|ABDEG|An intermediate table can be both a child and a parent; Task remains a base parent and User is a parent in this example.
28|Edit the pet_owner number definition in Number Maintenance~Change the display value on every user~Rename sys_id~Edit the browser title|Number Maintenance controls the prefix used for newly numbered records; this does not automatically rename existing records.
29|Requires role, using an appropriate manager role~The field label~The list sort order~The update set description|Use a manager role in the ACL; a user's manager reference alone does not automatically grant a manager role.
30|A field marked Coalesce in the transform map~Every display field automatically~The source file name~The import user's email only|Coalescing uses selected field values as matching keys during transformation.
31|ADEF|Schema Map shows reference directions and extension relationships between tables.
''',
'package': '''
1|ACD|UI actions can be form context menu entries, form links, and list buttons.
2|ACEF|The four classic client script types are onLoad, onChange, onSubmit, and onCellEdit.
3|A condition-based rule that controls form field behavior such as mandatory, visible, or read-only~A database backup~An email delivery schedule~A user password policy only|UI policies handle conditional form behavior with little or no scripting.
4|Application scope~List personalization~A notification subscription~A table index|Scope namespaces application artifacts and helps control cross-application access.
5|JavaScript~Python~Ruby~SQL only|ServiceNow uses JavaScript for platform client-side and server-side scripting.
6|A client request to the server and the response back to the client~A record moving between two groups~A table extending itself~A user visiting two dashboards|A round trip includes request transmission, server processing, and response transmission.
7|50~100~200~1000|A lower order value runs before 100; avoid relying on ties to determine order.
8|The client~The database engine~The import set~The MID Server|The user's browser is the client in the client-server model.
9|On ServiceNow-managed cloud infrastructure~Only in the user's browser~Only on the user's laptop~Inside a report definition|The service hosts the server and database components remotely from the browser client.
10|AD|The intended training distinction is Global versus a private application scope, commonly described as global versus scoped applications.
11|A Data Policy enforces data requirements on server-side operations; a UI Policy controls form behavior in the browser~A UI Policy always secures API access~A Data Policy only changes colors~They both run only when a dashboard opens|Data Policies can enforce mandatory and read-only rules beyond forms, subject to their import and API settings.
12|onLoad~onSubmit~onCellEdit~onDelete|onLoad executes when the form loads.
13|A UI Policy with UI Policy Actions~An import set~A scheduled report~An instance clone|UI Policy Actions can make fields mandatory, visible, and read-only when a condition is met.
14|BCEF|Supported configuration such as Business Rules, forms, reports, and roles is captured; ordinary business data is not.
15|Enable the appropriate display location and ensure its condition and role requirements are satisfied~Add the action to a user's favorites~Run a data import~Set every user to admin|A UI action must be configured to appear in that context and pass applicable conditions and roles.
16|onCellEdit~onLoad~onSubmit~onDelete|onCellEdit responds to list cell edits. Use server-side logic if the rule must apply to every update channel.
17|Set a field's mandatory, visible, or read-only behavior~Grant database roles to users~Move records to another instance~Create all catalog tasks|UI Policy Actions apply configured field attributes when policy conditions are met.
18|An update set~A report subscription~A list favorite~A knowledge category|Update sets group supported configuration changes for migration.
19|BCDE|The When choices are before, after, async, and display; insert and query describe operations instead.
20|onSubmit~onLoad~onCellEdit~onDelete|onSubmit validation runs before submission and can return false to prevent it in supported form contexts.
21|Retrieve or import, preview, resolve preview issues, then commit~Commit, retrieve, then preview~Delete, clone, then publish~Preview only, without committing|Preview reveals collisions and missing dependencies before changes are committed on the target.
22|Complete~In progress~Ignore~Cancelled|Mark a finished source update set Complete before transferring it.
23|A display Business Rule, using g_scratchpad to pass data to the client when needed~An onCellEdit Client Script~An import set coalesce field~A notification subscription|Display Business Rules run server-side as a form is loaded and can prepare data for the client.
24|Automated Test Framework (ATF)~Number Maintenance~Event Registry~List Layout|ATF runs repeatable functional tests, commonly in non-production instances, to check for regressions.
25|Delegated Development~Assign admin to every developer~Disable application scope~Share the production administrator password|Delegated Development grants scoped development capabilities without full administrator rights.
''',
'reporting': '''
1|BEF|Bar, pie, and donut charts are report visualization types.
2|Labels used to organize and find records~Database primary keys~Application scopes~Import set states|Tags organize records for retrieval without changing the table schema.
3|Reporting presents record-based results; Performance Analytics collects indicator scores over time for trends and targets~They both only send email~Performance Analytics replaces all ACLs~Reporting can never show dates|PA supports historical indicator analysis; reports can also visualize date-based record data.
4|A configured message sent to recipients when defined conditions or events occur~A mandatory database field~A table inheritance rule~An update set collision|Notifications communicate record or event information through configured delivery channels.
5|BD|Notification preferences are available through the user preferences interface and the corresponding self-service module where enabled.
6|Type~Data~Style~Schedule|The Type stage selects the visualization in classic Report Designer.
7|System Notification > Email > Notifications~System Definition > Tables~System Import Sets > Load Data~Service Catalog > Order Guides|Email notification definitions are managed in the Notifications module.
8|Sidebar~Schema Map~Number Maintenance~Transform Maps|Sidebar supports contextual conversations around work records in supported workspaces.
9|CDE|Reports visualize records, may be scheduled, and can be based on lists or existing reports.
10|BCE|An email notification defines its trigger, recipients, and content.
11|Insert and Stay~Update~Delete~Run only|Insert and Stay creates a copy and keeps the new report open for editing in the classic report interface.
12|A page that brings together reports and other widgets for monitoring information~A database row identifier~An import staging table~A single ACL rule|Dashboards combine related visualizations for an audience.
13|Configure~Data~Style~Schedule|The Configure stage includes grouping and aggregation settings in classic Report Designer.
14|CE|Tags may be added from form options or list record context actions, depending on the interface.
15|Add the report to a shared dashboard and give the intended users appropriate access~Email a screenshot once and delete the report~Grant admin to every viewer~Store it only as a personal favorite|A shared dashboard offers continued access while report and data permissions still apply.
16|Predictive Intelligence~Number Maintenance~An update set~A form section|Predictive Intelligence can classify and route work using trained models and suitable historical data.
17|Schedule the report for email delivery on Friday morning~Run it once on Monday~Only change the chart colors~Export its dictionary definition|Report scheduling defines recurring delivery time and recipients.
18|The Sidebar discussion panel with multiple conversation tabs~The schema map~The update set picker~The number counter|Sidebar's conversation interface supports managing discussions in supported workspaces; exact controls vary by release.
19|What it will contain~When to send~Who will receive~Advanced conditions only|The notification content section selects an email template; the template can reference an email layout.
20|System Logs > Events (Event Log)~Only My Work~The form designer canvas~The catalog shopping cart|The Event Log shows queued/generated platform events used in event-driven processing.
21|ABCDE|Email, scheduling, publishing, PDF export, and dashboards are all report distribution approaches, subject to permissions and interface support.
''',
}
DEFAULT_MODULE = {'exploring':2,'foundations':8,'building':3,'self_service':5,'manage':4,'package':3,'reporting':6}
# Explicit exceptions to the worksheet-level topic classification.
MODULE_OVERRIDES = {
'exploring':{5:7,6:8,9:3,11:1,12:1},
'foundations':{2:4,11:1,13:1,14:1,15:2,16:2,18:2,19:5},
'building':{3:4,8:1,12:4,21:4},
'self_service':{7:6,11:6,14:6,18:6,19:6,20:6,21:6,23:7,24:6,26:6,29:6},
'manage':{3:8,6:7,10:8,11:8,14:8,16:8,17:8,18:8,28:7,29:8},
'package':{4:8,6:2,8:2,9:2,14:7,18:7,21:7,22:7,24:7,25:8},
'reporting':{20:7},
}
PRACTICE_MODULES = {
1: [4,1,7,5,3,5,8,8,6,4,5,7,3,7,8,5,4,5,3,4,5,6,6,1,1,3,3,3,2,4,8,5,4,4,8,4,6,4,3,8,8,7,6,8,4,6,4,8,2,4,4,3,1,8,3,5,4,6,4,7],
2: [4,3,4,5,6,8,7,3,4,4,6,3,5,3,4,4,1,7,4,4,4,5,4,1,4,7,3,6,3,4,4,8,6,5,5,6,3,1,3,1,4,3,3,3,8,4,6,3,1,3,4,8,8,7,8,8,6,5,3,5],
}

# module | difficulty | type | prompt | choices (~ separated) | answer IDs | explanation
# For ordering questions, answer IDs specify the complete sequence.
ADDITIONAL = '''
1|easy|single_choice|Which Unified Navigation menu lists the applications and modules available to the current user?|All~History~Notifications~Update Sets|A|The All menu provides access to available application navigation entries.
1|easy|true_false|Adding a navigation favorite grants access to records that the user could not previously read.|True~False|B|Favorites provide shortcuts; they do not grant roles or bypass record security.
1|medium|multiple_choice|Which two actions help a user revisit work in Unified Navigation? Select 2.|Open a saved favorite~Review the History menu~Delete the application's modules~Remove the user's roles|AB|Favorites are saved shortcuts and History records recently visited destinations.
1|medium|scenario|An agent must manage several cases and related information in one purpose-built interface. Which option best fits this need?|An appropriate agent workspace~An import set staging table~The update set preview list~The system dictionary|A|Workspaces bring together role-oriented records and tools for an agent's work.
1|medium|single_choice|Why might two users see different entries in the All menu?|Their roles and the configured menu requirements differ~Every menu is randomly generated~The menu ignores application configuration~Favorites automatically hide all other modules|A|Navigation visibility depends on configured access and menu settings.
1|hard|scenario|A user can open a module but cannot read a record reached from it. What should an administrator investigate next?|The user's effective record and field access~Only the module's icon color~Only the browser zoom level~The number of navigation favorites|A|A visible navigation entry does not prove that the user passes the ACLs for its underlying records.
1|easy|single_choice|Which navigation feature is intended to help locate records across configured searchable content?|Global search~Number Maintenance~The update set selector~The schema map|A|Global search searches configured content; results remain subject to access controls.
1|hard|multiple_choice|Which two statements about a workspace are accurate? Select 2.|Its available capabilities depend on configuration and installed applications~Record security still applies to workspace users~Opening a workspace automatically grants admin~Every workspace must contain exactly the same pages|AB|A workspace is a configurable user experience operating within the platform's security model.
2|easy|single_choice|Which environment should host normal day-to-day business operations?|Production~A personal developer instance~A disposable test instance~A local browser cache|A|Production is the live environment used for business operations.
2|easy|true_false|Changing an instance's banner color automatically transfers its business records to another instance.|True~False|B|Branding changes visual presentation and has no data migration effect.
2|medium|scenario|A team wants to try a new capability that requires a plugin. What should the administrator do first?|Check requirements and entitlement, then evaluate it in a suitable non-production instance~Activate every available plugin in production~Delete the test instance~Give requesters the security_admin role|A|Check prerequisites and evaluate behavior in a controlled environment before a production rollout.
2|medium|multiple_choice|Which two are examples of instance configuration? Select 2.|Setting supported company branding properties~Configuring time zone defaults~Changing a customer's laptop processor~Editing ServiceNow's physical database server hardware|AB|Platform settings support organization-specific branding and defaults.
2|hard|scenario|A test instance will be refreshed from production. Which preparation best protects test-only integration settings?|Define and verify appropriate clone exclusions or preservers and post-clone steps~Assume all target settings are preserved automatically~Store every credential in a public report~Delete the source production instance|A|A clone may replace target data, so target-specific behavior must be deliberately preserved or reconfigured.
2|medium|single_choice|What is the main purpose of separating development, test, and production instances?|Validate changes before they affect live users~Make every user an administrator~Eliminate the need for access controls~Guarantee that defects cannot occur|A|Separate environments allow implementation and validation before live deployment.
2|hard|ordering|Order these activities for a controlled configuration rollout.|Implement the change in development~Validate the change in test~Deploy the approved change to production~Verify production behavior|ABCD|Development and test precede production deployment; verification checks that deployment achieved the intended result.
2|medium|single_choice|A user changes a personal preference. What determines whether it affects other users?|Whether the setting is user-specific or instance-wide~The length of the user's password~The number of open incidents~The chart type on the home dashboard|A|Personal preferences apply to a user, while system properties can affect broader instance behavior.
3|easy|single_choice|Which object groups related navigation modules?|Application menu~Import set row~Email layout~Field value|A|An application menu is a navigation container for modules.
3|easy|true_false|Removing a field from a form layout necessarily deletes the database field and its stored data.|True~False|B|Layout removal hides the field from that layout; deleting a dictionary field is a separate operation.
3|medium|multiple_choice|Which two requirements can be implemented using standard UI Policy Actions? Select 2.|Make a form field mandatory~Make a form field read-only~Grant a user a security role~Create a database backup|AB|UI Policy Actions control form field attributes; they do not manage users or backups.
3|medium|scenario|The same table needs a compact layout for agents and a detailed layout for managers. What is the most appropriate presentation feature?|Form views with suitable view selection rules~Duplicate the entire table for each manager~Disable all ACLs~Change every record's sys_id|A|Views support different layouts of the same underlying record data.
3|hard|scenario|A browser script prevents invalid input, but an integration still writes invalid values. What is the best next step?|Implement appropriate server-side validation for all required entry paths~Add another navigation favorite~Hide the field label~Ask the integration to change its browser theme|A|Client-side checks cannot enforce integrity for writes that do not pass through that browser form.
3|medium|single_choice|Which Business Rule timing is usually appropriate for changing values on the current record before it is saved?|Before~Display~Async after completion~Only a scheduled job|A|A before Business Rule can set values as part of the pending database operation.
3|hard|multiple_choice|Which two statements distinguish a Client Script from a Business Rule? Select 2.|Client Scripts run in supported client interfaces~Business Rules execute server-side for configured operations~All Business Rules run only in the browser~Client Scripts alone secure all REST updates|AB|The execution location and supported trigger determine which entry paths the logic covers.
3|medium|single_choice|Which dictionary property gives users a readable name for a field while scripts use its internal name?|Label~sys_id of the logged-in user~Update set state~Notification weight|A|A label is the user-facing field name; the internal name identifies the field in scripts and queries.
4|easy|single_choice|Which term describes a column in a ServiceNow table?|Field~Record~Instance~Group|A|A field defines an attribute whose value is stored on each record.
4|easy|true_false|Extending a table allows the child table to inherit fields from its parent.|True~False|A|Inheritance lets child tables reuse parent fields and add their own fields.
4|medium|multiple_choice|Which two objects are directly involved in a typical import-set transformation? Select 2.|An import set staging table~A transform map~A navigation favorite~A dashboard color palette|AB|Staging holds imported rows; a transform map defines how they populate the target.
4|medium|scenario|A nightly import should update existing equipment identified by a stable asset tag. What should the administrator configure?|A suitable coalesce field map for the asset tag~A random record number for each run~A new target table for every file~A favorite for the source file|A|Coalescing on a reliable identifier lets incoming rows match existing records.
4|hard|scenario|Two fields are configured to coalesce in a transform map. An incoming row matches only one of them. Under normal insert/update behavior, what happens?|No combined match is found, so the row is treated as an insert~The first partial match is always overwritten~Every target row is updated~The transform is always cancelled|A|With multiple coalesce fields, the configured field values must match together; scripts and map settings can alter insert behavior.
4|medium|single_choice|Which feature allows a report to reference the department of an incident's caller through a reference field?|Dot-walking~Role elevation~Instance cloning~Update set preview|A|Dot-walking follows references to fields on related records.
4|hard|ordering|Order a basic spreadsheet import using import sets.|Load the source rows into a staging table~Configure the transform map and field mappings~Run the transform~Review transform results and target records|ABCD|Loading and mapping precede transformation, and result review checks the imported data.
4|medium|single_choice|What is the key purpose of CI relationships in the CMDB?|Represent dependencies that support service and impact analysis~Assign every user the admin role~Replace all incident records~Store only report colors|A|Relationships describe how configuration items depend on or connect to each other.
5|easy|single_choice|Which feature helps employees find documented solutions to recurring issues?|Knowledge Management~Number Maintenance~The ACL operation picker~The update set collision list|A|Knowledge articles make reusable guidance available to an authorized audience.
5|easy|true_false|A record producer can collect catalog-style input and create a record in a target table.|True~False|A|Record producers provide a simplified entry experience for creating records such as incidents.
5|medium|multiple_choice|Which two are valid reasons to use a catalog variable set? Select 2.|Reuse a collection of variables across catalog items~Maintain related request questions as a group~Grant all requesters admin~Replace table-level ACLs for every application|AB|Variable sets reduce repeated configuration and organize related input questions.
5|medium|scenario|A new hire needs a laptop, phone, and access badge through one guided request. Which feature is best suited to this?|Order guide~Number counter~Table wildcard ACL~Import staging table|A|An order guide gathers related catalog items into a coordinated request experience.
5|hard|scenario|An employee matches both Can Read and Cannot Read criteria for a knowledge base. What is the expected access result for an ordinary reader?|Cannot Read takes precedence~Can Read always overrides the exclusion~The user automatically becomes a knowledge manager~The base becomes public|A|Exclusion criteria take precedence over inclusion criteria for the evaluated knowledge access.
5|medium|single_choice|What does a catalog item's variable usually capture?|Information needed to fulfill that request~A replacement for the instance database~The administrator's elevated role~The name of every application table|A|Variables collect choices and details needed to process the requested offering.
5|hard|ordering|Order this simplified knowledge lifecycle when review is required.|Draft the article~Submit it for review~Approve and publish it~Retire it when it becomes obsolete|ABCD|Drafting and review precede publication, and retirement removes obsolete guidance from normal use.
5|medium|single_choice|Which record typically represents a fulfillment task for a requested catalog item?|Catalog Task [sc_task]~User [sys_user]~Role [sys_user_role]~Table [sys_db_object]|A|Catalog tasks track work needed to fulfill a requested item, depending on its fulfillment process.
6|easy|single_choice|Which feature can populate several form fields with reusable predefined values?|A record template~A database clone~An ACL wildcard~A CI relationship|A|Templates reduce repeated data entry by applying predefined field values.
6|easy|true_false|A dashboard automatically grants viewers access to every underlying record shown by its widgets.|True~False|B|Dashboard visibility and access to underlying data are distinct permission checks.
6|medium|multiple_choice|Which two settings belong to an email notification definition? Select 2.|When the notification should be sent~Who should receive it~Which database server hardware to purchase~Which browser every customer must install|AB|Notification definitions specify triggering conditions, recipients, and message content.
6|medium|scenario|A support manager wants a monthly trend of a measured indicator, including historical scores and targets. Which capability best fits?|Performance Analytics~Form Layout~Number Maintenance~The scope picker|A|Performance Analytics supports indicator score collection, historical analysis, and targets.
6|hard|scenario|A scheduled report email would expose sensitive data to an unintended group. What should the owner review before enabling it?|Recipient configuration, report access, and the sensitivity of the delivered content~Only the chart's background color~Only the report title's capitalization~The number of user favorites|A|Distribution must be appropriate for the report's data and audience; access to the dashboard alone does not settle email delivery requirements.
6|medium|single_choice|What is an assignment group's main role on a task?|Identify the team responsible for handling the work~Define the task's sys_id~Replace the task's table~Choose the customer's database engine|A|Assignment groups route work to the team expected to handle it.
6|hard|multiple_choice|Which two statements about flow data are correct? Select 2.|A later action can use compatible output data from an earlier action~Data pills represent available values in the flow context~Every output is automatically a public system property~An action can always use an output from a future step before it runs|AB|Flow data depends on execution context, data type, and the outputs available at that point.
6|medium|single_choice|An agent wants a quick visual summary of incident counts by priority. Which presentation is most suitable?|A grouped report on a dashboard~An ACL debug trace as the end-user chart~A list of update set collisions~A password policy definition|A|Grouping and aggregating incident data produces the requested summary.
7|easy|single_choice|Which tool packages supported configuration changes for transfer between instances?|Update set~Order guide~Navigation favorite~List breadcrumb|A|Update sets collect supported configuration updates for migration.
7|easy|true_false|Ordinary incident and user data are automatically included whenever an update set is completed.|True~False|B|Update sets track supported configuration; ordinary business records require a suitable data-transfer method.
7|medium|multiple_choice|Which two actions should happen before committing a retrieved update set? Select 2.|Preview it on the target~Resolve relevant preview problems~Delete the target instance~Assume every missing dependency will create itself|AB|Preview and issue resolution reduce deployment failures and unintended overwrites.
7|medium|scenario|A team wants repeatable checks that its custom process still works after an upgrade. What should it use?|Automated Test Framework in a suitable non-production environment~A longer record prefix~A public dashboard alone~A new favorite per tester|A|ATF supports repeatable functional validation of configured behavior.
7|hard|scenario|Preview reports that an incoming update would overwrite a newer local customization. What is the best response?|Compare the changes, decide the intended version, and resolve the collision before committing~Always accept the incoming update without inspection~Delete the current user's account~Rename the update set and assume the collision disappears|A|A collision requires a deliberate decision about the version that should be deployed.
7|medium|single_choice|Which table or module should help determine whether a named platform event was queued?|Event Log~My Favorites~Number Maintenance~Form Layout|A|Event records support troubleshooting event-driven processing and notifications.
7|hard|ordering|Order the target-side application of a completed update set.|Retrieve or import the update set~Preview it~Resolve preview problems~Commit and validate the result|ABCD|Target-side preview and resolution should precede committing and validating changes.
7|medium|single_choice|An integration action needs to communicate with an internal system unreachable directly from the cloud instance. Which component may be appropriate?|A MID Server configured for the integration~A user's browser favorite~An extra field label~A new knowledge category|A|A MID Server can facilitate supported integrations between the instance and systems inside a private network.
8|easy|single_choice|Which object groups permissions that can be assigned to users or groups?|Role~Report color~List breadcrumb~Import file name|A|Roles represent access capabilities and can be managed through group membership.
8|easy|true_false|Hiding a form field with a UI Policy is sufficient to secure that field against all API access.|True~False|B|Presentation logic is not a substitute for server-enforced access controls.
8|medium|multiple_choice|Which two practices support maintainable access administration? Select 2.|Grant roles through appropriate groups~Give users only the access needed for their responsibilities~Assign admin to every requester~Share one administrator login across the company|AB|Group-based assignment and least privilege make permissions easier to manage and review.
8|medium|scenario|An administrator must reproduce the access issue of a requester without knowing the requester's password. Which feature is appropriate?|Authorized user impersonation~Changing the requester's sys_id~Deleting all ACLs~Publishing the entire table|A|Impersonation permits authorized troubleshooting in the user's access context.
8|hard|scenario|A user passes an applicable field read ACL but fails all applicable table read ACLs. Can the user read that field on those records?|No, table read access is also required~Yes, field access always overrides table access~Yes, if the field label is visible~Yes, if the record was bookmarked|A|Field read permission does not bypass the required table-level read checks.
8|medium|single_choice|Which elevated role is associated with creating or changing ACL rules?|security_admin~catalog_admin~approver_user~import_set_loader|A|security_admin elevation enables protected security administration functions.
8|hard|multiple_choice|For a classic Allow If ACL with roles, a condition, and a script configured, which two statements are correct? Select 2.|The user must satisfy the applicable condition and script checks~The user must have at least one required role listed on that ACL~Passing the role check automatically skips a false condition~Every role on the instance is implicitly granted|AB|The configured checks within that rule must pass; having one of its listed roles satisfies that rule's role requirement.
8|medium|single_choice|What does the ACL name sys_user.department identify?|The department field on the User table~Every field on every table~The Department table's user field~The current user's password only|A|Field ACL names use the internal table name followed by a dot and the internal field name.
'''
