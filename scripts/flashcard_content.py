"""Recall prompts and focused cards derived from the existing CSA answer keys.

Keep choices and grading unchanged. Overrides make choice-dependent prompts
stand alone; focused cards separate concepts rather than repeat distractors.
These are study adaptations, not independently verified ServiceNow claims.
"""

# Answer text for the primary card comes from the source's correctChoiceIds.
FRONTS = dict(line.split('|', 1) for line in '''
src_de2cd987bc89914f|Name three forms that UI actions can take on forms and lists.
src_345d8894b9614e7d|How do tables, records, and fields relate to each other?
src_653ad992f137c87b|How do you open a form field's context menu, and what configuration actions can it offer authorized users?
src_0d8623f90e47a130|Give two examples of script-based customizations: one for record cleanup and one for automatically populating a field.
src_5c3862892f2861c8|Name three common ways users interact with the ServiceNow platform.
src_c927dd3a8c4d3176|Describe ServiceNow's client/server interaction, instance architecture, and hosting model.
src_5d53fb2415ae3a8c|Name three application navigation entries that can match a search for "table" in this study scenario.
src_f20b1db71d107da2|How do fields, tables, and records correspond to columns, containers, and rows?
src_3dbb2ea2e3ee6e50|Distinguish a field's label, internal name, and stored value.
src_c225f470a9d5bb43|plant_user extends User; plant_management_task extends Task; plant_management_task_item extends plant_management_task. Identify the parent/child roles of plant_management_task and the parent roles of Task and User. Also identify the base table in the task branch.
src_199094671f301aba|How do a list, a record, a column, and a table relate to stored data?
src_5faf29727544356e|When a table extends another table, what fields can it contain?
src_27fafeb80293697d|How are record numbers incremented by the system?
src_aa1b003dc2a88130|How do Insert, Save, and Update differ in their effects on a record and whether the form stays open?
src_2f6955cecffc497c|Explain single-field, multiple-field, and conditional coalescing during imports.
src_35ba321d49902a2f|Describe Reference, String, and Choice field types.
src_3024a19efcda2f93|Distinguish base, custom, and core tables, including what determines whether a core table can be extended.
src_323d562c7781f023|How do you open a column context menu, and what list operations can it offer?
src_5eddbc3f2234d784|Can a transform map be reused, and what does it define about the destination of imported data?
src_3cb6f1efb746e85a|What does a Service Catalog request represent, what can it contain, and what does its number track?
src_fb39a550d170444d|Name four ways to give feedback on a knowledge article when the corresponding feedback features are enabled.
src_075fd3f2b42dbf88|Name three Service Catalog variable types for choosing among options, referencing a record, and checking a box.
src_e188624b770a5f5f|Which security administration task requires elevation to security_admin?
src_9eefa172533c55a2|To whom can roles be assigned, can roles contain other roles, and where are role records stored?
src_b91affac24da8176|Name five common user personas described in this study bank.
src_3039dfe8c8b66bd8|What access do roles grant, can they contain other roles, and where are their records stored?
src_afba372d028c38de|What do the My Reports, Group, Global, and All tabs show in the classic View/Run reports interface?
src_7655dc1905a131ee|How can reports be run, what do they help users do, and where can they be created?
gen_m01_008|How do configuration, installed applications, and record security affect a workspace?
gen_m02_004|Give two examples of instance configuration involving company appearance and time settings.
gen_m03_003|Name two form-field requirements that standard UI Policy Actions can enforce.
gen_m03_007|Where do Client Scripts and Business Rules execute?
gen_m05_003|What are two reasons to use a catalog variable set?
gen_m06_007|What do flow data pills represent, and how can later actions use earlier action outputs?
gen_m08_007|Within a classic Allow If ACL that has roles, a condition, and a script configured, how are its role requirement and other checks satisfied?
gen_m02_007|What is the sequence for a controlled configuration rollout from development through production verification?
gen_m04_007|What is the sequence for a basic spreadsheet import using import sets, from loading through result review?
gen_m05_007|What is the simplified knowledge article lifecycle from drafting through retirement when review is required?
gen_m07_007|What is the target-side sequence for applying a completed update set, from retrieval through validation?
'''.strip().splitlines())

# Each line: source question | stable concept key | front | back.
# Preserve prerequisites in the prompt and avoid treating distractors as facts.
FOCUSED = '''
src_51336e4d304fb4e6|elevation|Which menu provides access to role elevation for authorized users?|The user menu.
src_5c5ac8fe37da2183|navigation|In classic UI16, which main area contains application navigation?|The Application Navigator.
src_5c5ac8fe37da2183|banner|In classic UI16, which main area contains header controls?|The Banner Frame.
src_5c5ac8fe37da2183|content|In classic UI16, which main area displays the selected application's content?|The Content Frame.
gen_m01_003|history|Which Unified Navigation menu helps you return to recently visited destinations?|History.
gen_m01_002|security|Does a saved favorite grant additional record access?|No. It provides a shortcut and does not grant roles or bypass record security.
gen_m01_008|workspace-security|Do ACLs still apply when records are opened in a workspace?|Yes. Workspace users remain subject to record security.
src_489a04bfacf54e49|request|In the request-response cycle, which component sends a request and which processes it?|The browser/client sends the request; the server processes it and returns a response.
src_f55a43131b270033|banner-image|Which My Company branding setting changes the banner graphic?|Banner Image.
src_f55a43131b270033|banner-text|Which My Company branding setting changes the banner wording?|Banner Text.
src_0d8623f90e47a130|server-customization|What script-based customization in this bank performs record cleanup?|A Script Include that cleans up incomplete records from a table.
src_0d8623f90e47a130|client-customization|What script-based customization in this bank populates a field when another box is checked?|A client-side script.
gen_m02_007|preproduction|Which environments should a controlled configuration change pass through before production?|Implement it in development, then validate it in test.
gen_m02_007|verification|What follows deployment of an approved change to production in a controlled rollout?|Verify production behavior.
gen_m02_008|preference-scope|What distinguishes a personal preference from an instance-wide system setting?|A personal preference applies to a user; an instance-wide setting can affect broader instance behavior.
src_cbf05f278c48e3ac|list-layout|Does List Layout configure a form's fields?|No. List Layout configures lists; Form Builder, Form Design, and Form Layout configure forms.
src_de2cd987bc89914f|buttons|Can a UI action appear as a button?|Yes. Buttons are one supported UI action presentation.
src_5e048b6d8f04b617|configuration|Who is the shared list layout configuration intended to affect?|Users of that view, subject to their personal list preferences.
src_5e048b6d8f04b617|personalization|Who is affected by list personalization?|The current user.
src_56290bb3ab269252|field|In a filter condition, what identifies the attribute being tested?|The field.
src_56290bb3ab269252|operator|In a filter condition, what specifies the comparison to perform?|The operator.
src_56290bb3ab269252|value|In a filter condition, what is compared with the selected field?|The value.
src_38fafa984bf6fad0|view-security|Are form views sufficient to secure field data?|No. Views control presentation; use ACLs to secure field data.
src_31e0c63891b00b9d|onload|Which Client Script type runs when a supported form loads?|onLoad.
src_31e0c63891b00b9d|onchange|Which Client Script type responds to a field value changing in a supported form?|onChange.
src_31e0c63891b00b9d|onsubmit|Which Client Script type validates a supported form before submission?|onSubmit.
src_31e0c63891b00b9d|oncelledit|Which Client Script type handles supported list-cell edits?|onCellEdit.
src_1b02dbef317bf110|mandatory|Which UI Policy Action attribute controls whether a form field requires a value?|Mandatory.
src_1b02dbef317bf110|visible|Which UI Policy Action attribute controls whether a form field is shown?|Visible.
src_1b02dbef317bf110|readonly|Which UI Policy Action attribute controls whether a form field can be edited?|Read-only.
src_bd5766e8144a4400|data-policy|Which kind of policy enforces data requirements on server-side operations?|A Data Policy, with enforcement configured for the relevant entry paths.
src_bd5766e8144a4400|ui-policy|Which kind of policy controls form behavior in the browser?|A UI Policy.
src_a9d1f34fbcdd8b63|scratchpad|How can a display Business Rule pass server-derived data to the client?|Use g_scratchpad when needed.
src_aa1b003dc2a88130|insert|What does the standard Insert action do on a form?|Creates a new record and exits the form.
src_aa1b003dc2a88130|save|What does the standard Save action do on a form?|Saves changes to the current record without exiting the form.
src_aa1b003dc2a88130|update|What does the standard Update action do on a form?|Updates the existing record and exits the form.
gen_m03_005|validation-paths|Why can browser-only validation fail to protect data written by an integration?|Integration writes may not pass through the browser form; appropriate server-side validation is needed.
gen_m03_002|layout-removal|What happens to stored data when a field is merely removed from a form layout?|It remains stored. Removing the database field is a separate operation.
src_345d8894b9614e7d|table|What does a table contain?|Records, with each record containing field values.
src_345d8894b9614e7d|record|What does a database row correspond to in ServiceNow?|A record.
src_345d8894b9614e7d|field|What does a database column correspond to in ServiceNow?|A field.
src_a57120dc836f2c43|updated|What internal system field records when a record was last updated?|sys_updated_on.
src_a57120dc836f2c43|created-by|What internal system field records who created a record?|sys_created_by.
src_3dbb2ea2e3ee6e50|label|Which field property is the user-friendly name displayed in the interface?|The field label.
src_3dbb2ea2e3ee6e50|name|Which field property identifies the field to scripts and the system?|The internal field name.
src_3dbb2ea2e3ee6e50|value|What is a field's stored value?|The actual data entered in that field on a record.
src_4823d68bff91f333|base|What defines a base table?|It does not extend another table.
src_4823d68bff91f333|core|What defines a core table?|It is supplied with the platform.
src_c225f470a9d5bb43|parent-and-child|If plant_management_task extends Task and plant_management_task_item extends plant_management_task, is plant_management_task a parent or a child?|Both: a child of Task and a parent of plant_management_task_item.
src_5faf29727544356e|inherited-fields|What happens to a parent's fields when a child table extends it?|The child inherits the parent's fields.
src_5faf29727544356e|own-fields|Can a child table define fields that do not exist on its parent?|Yes. It can add its own fields.
src_2cdaaf17661552dc|cmdb-ci|Which CMDB table stores configuration items?|Configuration Item [cmdb_ci].
src_2cdaaf17661552dc|cmdb-relationships|Which CMDB table stores relationships between configuration items?|CI Relationship [cmdb_rel_ci].
src_2cdaaf17661552dc|cmdb-base|Which base configuration table is included in the bank's three key CMDB tables?|Base Configuration [cmdb].
src_2f6955cecffc497c|single-coalesce|How does single-field coalescing match an imported row to an existing record?|It uses one configured field; a matching value identifies a record to update.
src_2f6955cecffc497c|multiple-coalesce|With multiple coalesce fields, must one field or all configured fields match?|All configured coalesce fields must match together for a matching record to be updated.
src_2f6955cecffc497c|conditional-coalesce|What controls matching in conditional coalescing?|Scripts and conditions determine the matching fields or matching logic.
src_8720fc88ef9a2b00|automatic-mapping|Which mapping utility automatically matches import-set fields to target fields?|The Automatic Mapping Utility.
src_8720fc88ef9a2b00|manual-mapping|Which mapping utility lets an administrator map import fields manually?|The Mapping Assist Utility.
src_9b35e382ca2a561f|kb-articles|What is the relationship between a knowledge base and its articles?|One knowledge base can contain many knowledge articles.
src_9b35e382ca2a561f|article-attachments|What is the relationship between a knowledge article and its attachments?|One knowledge article can have many attachments.
src_d65568daa3d99ac6|change-hierarchy|If Change Request extends Task and Emergency Change Request extends Change Request, what roles does Change Request have?|It is a child of Task and a parent of Emergency Change Request.
src_35ba321d49902a2f|reference|Which field type links to a record in another table?|Reference.
src_35ba321d49902a2f|string|Which field type accepts text such as letters, numbers, and special characters?|String.
src_35ba321d49902a2f|choice|Which field type displays a drop-down of predefined options?|Choice.
gen_m04_003|staging|What is the purpose of the import-set staging table?|It temporarily holds imported source rows before transformation into the target table.
gen_m04_003|transform|What defines how imported staging data populates a target table?|A transform map and its field mappings.
gen_m04_007|first-step|What is the first step in the bank's basic spreadsheet import sequence?|Load source rows into an import-set staging table.
gen_m04_007|last-step|What should be reviewed after running an import-set transform?|Transform results and the resulting target records.
src_de56d6b08d73d953|cannot-read|Which knowledge-base user criteria exclude users from reading its articles?|Cannot Read.
src_de56d6b08d73d953|cannot-contribute|Which knowledge-base user criteria exclude users from creating or modifying articles?|Cannot Contribute.
src_075fd3f2b42dbf88|masked|Which catalog variable type is used for password-like input?|Masked.
src_3cb6f1efb746e85a|request-container|What does a request act as in the Service Catalog order model?|A container for the entire order.
src_3cb6f1efb746e85a|request-items|How many requested items can a single request contain?|One or more requested items.
src_db4dfb3735cae0a3|criteria-boundary|Do knowledge/catalog user criteria replace general table ACLs?|No. User criteria govern knowledge and catalog availability; general table ACLs are separate.
src_4f614ac42bdf212d|wiki-prerequisite|What prerequisite does this bank specify for Wiki knowledge article bodies?|The Knowledge Management Wiki Support plugin must be enabled.
src_a2471dd972ea8ac3|req|In the catalog order hierarchy, what does REQ track?|The request for the overall order.
src_a2471dd972ea8ac3|ritm|In the catalog order hierarchy, what does RITM track?|A requested item within the request.
gen_m05_003|reuse|How can the same related request questions be reused across catalog items?|Use a catalog variable set.
gen_m05_007|review|In the bank's simplified knowledge lifecycle with required review, what comes between drafting and publication?|Submit the article for review, then approve it before publication.
gen_m05_007|retirement|What should happen to a knowledge article when it becomes obsolete?|Retire it.
src_52d19ff313e1eee0|trigger|Which flow component starts execution?|The trigger.
src_52d19ff313e1eee0|actions|Which flow components perform the work after a trigger starts a flow?|Actions.
src_612ea52b683e916e|outputs|How can later flow steps use the result of an earlier action?|Use compatible action outputs through data pills.
src_6e19988ad25f3d79|when|Which notification section defines its sending conditions or trigger?|When to send it.
src_6e19988ad25f3d79|who|Which notification section defines its recipients?|Who receives it.
src_6e19988ad25f3d79|what|Which notification section defines its message content?|What it will contain.
src_afba372d028c38de|my-reports|What does My Reports show in the classic View/Run interface?|Reports created by the current user.
src_afba372d028c38de|group-reports|What does the Group tab show in the classic View/Run interface?|Reports shared with a group to which the current user belongs.
src_afba372d028c38de|global-reports|What does the Global tab show in the classic View/Run interface?|Reports shared as global.
src_afba372d028c38de|all-reports|Does the All reports tab mean all reports regardless of access?|No. It shows all reports available to the logged-in user.
src_fd48ebd587df7c70|reporting|What does Reporting primarily present in the bank's comparison with Performance Analytics?|Record-based results.
src_fd48ebd587df7c70|analytics|What does Performance Analytics collect for analyzing trends and targets?|Indicator scores over time.
src_011c40bc266ffe76|layout-template|How can an email notification use an email layout according to this bank?|Select an email template in What it will contain; the template can reference the layout.
gen_m06_002|dashboard-security|Does dashboard visibility automatically grant access to all underlying records?|No. Underlying data access has separate permission checks.
src_d3cf1bc833314791|event-log|Which event feature contains generated event records?|The Event Log.
src_d3cf1bc833314791|event-registry|Which event feature defines named events for event-driven processing?|The Event Registry.
src_d04873a1479efcb5|business-data|Are ordinary business records the intended contents of update sets?|No. Update sets package supported configuration changes, not ordinary business records.
src_1aa94cd42cfeacda|preview|What should happen after retrieving or importing an update set and before committing it?|Preview it and resolve relevant preview issues.
gen_m07_007|commit-validation|What should follow resolving update-set preview problems?|Commit the update set and validate the result.
gen_m07_004|test-environment|Where should repeatable ATF checks for an upgrade be evaluated?|In a suitable non-production environment.
src_9eefa172533c55a2|role-table|Which table stores role records?|Role [sys_user_role].
src_9eefa172533c55a2|contained-roles|Can a role contain other roles?|Yes.
src_9eefa172533c55a2|role-assignment|Can roles be assigned to users as well as groups?|Yes. Group-based assignment is preferred for maintainable administration.
src_652b0a72f1f7a80f|end-elevation|How can an administrator end security_admin elevation without logging out?|Open Elevate Roles in the user menu and uncheck security_admin.
src_caef988bfdd9d317|crud|With Create access controls enabled for a new custom table, what four standard operations get ACLs?|Create, Read, Write, and Delete.
src_251ecaccc3355f78|acl-checks|Which three kinds of permission checks can an ACL specify?|Roles, conditional expressions, and scripts.
src_1d2a90ce9b95d193|acl-object|What does an ACL identify besides its permission conditions?|The object being secured and the operation being controlled.
src_86857b90920324ee|acl-table|In sys_user.department, which part identifies the table?|sys_user.
src_86857b90920324ee|acl-field|In sys_user.department, which part identifies the field?|department.
src_6ffc614969614d62|group-assignment|What is the recommended way to grant the same role consistently to a team?|Assign the role to an appropriate group and add the team members to that group.
gen_m08_003|least-privilege|How much access should users receive under least privilege?|Only the access needed for their responsibilities.
gen_m08_007|acl-roles|Within one classic Allow If ACL, must a user have every listed required role?|No. At least one of the listed required roles satisfies that rule's role requirement.
gen_m08_007|acl-condition-script|Within one classic Allow If ACL with both a condition and a script configured, must both checks pass?|Yes. The applicable condition and script checks must both pass, along with the rule's role requirement.
gen_m08_005|table-field-access|Does passing a field read ACL bypass a failed table read check?|No. The required table-level read access must also be granted.
gen_m08_002|presentation-security|Does hiding a field using a UI Policy secure it against API access?|No. Use server-enforced access controls for data security.
'''.strip()


def focused_cards():
    result = {}
    for line in FOCUSED.splitlines():
        source, key, front, back = line.split('|')
        result.setdefault(source, []).append((key, front, back))
    return result
