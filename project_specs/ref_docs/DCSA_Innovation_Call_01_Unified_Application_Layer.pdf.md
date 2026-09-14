<!-- Text extracted by Pivota from DCSA_Innovation_Call_01_Unified_Application_Layer.pdf (PDF). The original file is alongside this one. -->

# DCSA_Innovation_Call_01_Unified_Application_Layer.pdf

1

DCSA INNOVATION CALL #01

DCSA INNOVATION GATEWAY

INNOVATION CALL #01
Unified Application Access and Integration Prototype

Notice to Vendors

For instructions on submission of Solution Concept Papers and Full Project Proposals, please review the
DCSA Innovation Gateway (HS0021-26-CSO-DCSA) general solicitation.

Innovation Call Publication & Change History

Table 1 - Publication & Change History
Date  Description

09/10/2026  Innovation Call Posting

  Reserved for future amendments.

Dates

Table 2 - Dates

Innovation Call Posting  09/10/2026

Questions Due Date  09/14/2026 @ 11:00am ET

Live Q&A Session

09/16/2026 @ 11:00am ET

Microsoft Teams meeting:
https://dod.teams.microsoft.us/meet/993839800233?p=QGRFzEOMqxdB0SqV
OW
Meeting ID: 993 839 800 233
Passcode: MX3jt3Ed
________________________________
Dial in by phone
+1 410-874-6749,,498233247# United States, Odenton
+1 410-874-6739,,498233247# United States, Odenton
Phone conference ID: 498 233 247#
Solution Concept
Paper Due Date  09/18/2026 @  9:00am ET

Estimated Period of
Performance Start:  10/15/2026

 2

DCSA INNOVATION CALL #01

Point of Contact (POC)

Please send all questions and submissions via email to the following POCs:

Agreements Officer (AO):  Daniela Garavito, daniela.garavito2.civ@mail.mil

Agreements Specialist (AS):  Salima McCravey,  salima.a.mccravey.civ@mail.mil

➔ Use the following email subjects for your email correspondence:

Q&A:  “DCSA –  Innovation Call #01 –  Q&A - [insert Company Name]”

Solution Concept Paper:  “DCSA –  Innovation Call #01 –  Concept Paper [insert Company Name] ”

Live Q&A Session

The Government will conduct a live Q&A  session. Offerors are highly encouraged to submit questions in
advance via email by the deadline listed in the above table. The Government will utilize the live session to
address the majority of the pre-submitted questions and cannot guarantee responses to newly
introduced questions during the event. In the event of any discrepancy between the information
provided verbal ly or in writing during the information session, the written terms and conditions of the
Innovation Call #01 and DCSA Innovation Gateway General Solicitation HS0021-26-CSO-DCSA shall prevail.

Expected Awards
The Government plans to make one award but may make multiple awards or none. The  number of
resources made available under this Innovation Call will depend on the quality of the proposals received,
the availability of funds, and the proven value of the capabilities developed in subsequent phases.

Use of Automated Evaluation Tools

To promote efficiency, the Government may employ automated tools, including Generative Artificial
Intelligence (AI) for the Department of War (Gemini , Grok, and ChatGPT  in https://genai.mil), to support
its evaluation. These tools may be used to assist with initial compliance screening, analysis of content
against requirements, and summarizing information to aid human evaluators.

1. PROBLEM STATEMENT

DCSA’s mission operations for personnel vetting, industrial security, counterintelligence, and insider -
threat activities are supported by multiple separate applications that users must navigate to complete
related work. This fragmented environment creates disconnected workflows, inconsistent authentication
and user experiences, and inefficient access paths that increase user burden and reduce operational
efficiency. It also adds complexity to the sustainment, modification, and modernization of mission
applications and services.

DCSA requires a more unified and user -centered approach that improves workflow continuity and
usability while preserving continuity of operations for existing Individual Engagement (IE) applications
during prototype development and evaluation. The underlyi ng challenge is to transition from siloed
legacy capabilities to an integrated platform of modular components that can support phased integration,
replacement, and modernization of back -end services without disrupting the user experience or mission
executi on.

 3

DCSA INNOVATION CALL #01

2. BACKGROUND

DCSA is modernizing its business and technology environment to reduce fragmentation among mission
applications, services, and supporting capabilities that better support the background-investigation
mission. DCSA supports a broad base of users from individuals (both US citizens and non-US citizens) with
no current government affiliation, industry / private sector users, federal employees, military, and
Department of War (DoW) civilian employees. The current environment consists of multiple applications
and components, across AWS GovCloud IL4 and IL5 environments, that support distinct mission functions.
The environments included IL2 in the past and could in the future. Users may have multiple roles and
attributes requiring users to login and navigate separate applications to complete related tasks, creating
disconnected workflows, inconsistent user experiences, and increased sustainment and change-
management complexity.

The existing Individual Engagement (IE) application environment includes applications, forms, services,
and supporting integrations used by authorized DCSA users and, where applicable, individuals
participating in the personnel-vetting process. The prototype will be evaluated using the existing IE
application environment (AWS GovCloud IL4). Existing IE applications must remain available during
prototype development, integration, testing, demonstration, and evaluation activities. If the IE prototype
effort is successful, the prototype efforts will continue in the mission application environment (AWS
GovCloud IL5).

The modernization effort envisions a unified platform composed of interoperable modular and
composable components organized around mission capabilities rather than a single monolithic
replacement system. Under this approach, legacy capabilities can be transitioned, integrated, or replaced
incrementally while maintaining continuity of operations. The target environment includes a consistent
dashboard and workflow experience, while transparently routing transactions to the appropriate
underlying service. The environment must be secure-by-design and align with zero-trust principles, be
modular and composable with components aligned to mission capabilities, separate business logic / rules
from applications, and support API and event-driven integration. The environment will be delivered
through modern DevSecOps practices and deployed as infrastructure as code.

DCSA is modernizing to:
  Secure and improve mission-user experience: Provide investigators, adjudicators, and other
authorized users a single entry point applying least-privilege access management for accessing
work items, status information, alerts, and relevant mission functions.
  Reduce fragmentation: Transition from siloed, legacy applications and “clunky” service
interactions to a more cohesive, intuitive, and integrated platform.
  Enable incremental delivery: Allow capabilities to be developed, integrated, and modernized as
services without requiring wholesale replacement of all existing functionality at once.
  Increase agility and maintainability: Establish reusable services and interfaces that can more
readily accommodate evolving mission needs, process improvements, and technology changes.
  Support enterprise alignment: Consolidate and organize capabilities into a unified platform and
enabling-service model, reducing duplication and improving the ability to manage enterprise-
level functions.
The intended end state is a modern DCSA environment in which users can perform mission work through
an intuitive, consistent interface, while the underlying platform manages integration with the appropriate
services and applications.

 4

DCSA INNOVATION CALL #01

3. PROJECT GOAL

The goal of this project is to establish a DCSA solution that provides a secure, scalable, unified, user-
centered experience across modernized mission services while enabling the incremental transition from
legacy applications to an integrated platform. The solution will serve as a common entry point, with
multiple identity and access management service providers, through which authorized users can access
relevant workflows, work items, status information, alerts, and mission capabilities without needing to
navigate among multiple underlying systems.

The solution shall enable a consistent user login and user experience while allowing underlying
applications and modular components (e.g. microservices) to be integrated, modernized, or replaced with
minimal disruption to mission operations. The solution shall align with zero-trust principles and support
integration through API and event-driven architecture.

As part of this effort, the vendor will sustain and enhance IE applications to include Investigation
Management (IM), Electronic Application (eApp), Position Designation Tool (PDT), and Individual
Engagement Portal (IEP), and integrations (e.g., MuleSoft API) throughout the prototype period to reduce
cross-contractor dependencies and establishes clear accountability for resolving defects, releases,
integration issues, and performance problems affecting the integrated environment.

The vendor shall ensure that their migration, integration, and ongoing operation preserve required
mission functionality and user continuity while establishing a repeatable model for onboarding additional
DCSA applications and services to the solution.

The initial prototype will focus on eApp, IEP, PVQ, and PDT to validate the approach across representative
mission workflows and application interfaces. This initial scope is intended to provide sufficient technical
and operational evidence to assess the viability of the approach before broader implementation. The
prototype will also establish and assess repeatable integration and onboarding patterns for additional
DCSA applications and services. Based on prototype results, mission priorities, available resources, and
the readiness of additional applications, DCSA may pursue subsequent prototype activities to integrate or
evaluate additional capabilities before making a production-transition decision. Subsequent prototype
activities to integrate or evaluate additional applications may be considered based on prototype results,
mission priorities, available resources, and applicable approval processes.

 5

DCSA INNOVATION CALL #01

4. PROJECT PHASES

The Government anticipates the following project phases. Offerors may propose an alternative
sequencing approach if it achieves the same objectives, provides equivalent decision-quality evidence,
and supports Government review at the stated decision points.

The following activities will occur throughout all prototype phases:

IE Application Sustainment. The vendor will sustain the identified IE applications and associated
integrations throughout the prototype period. Sustainment includes operational support, incident and
defect resolution, patching, release support, and security and authorization support necessary to
maintain application availability and enable prototype integration, testing, demonstration, and
evaluation. General application enhancements unrelated to the common application interface are not
within the base prototype scope.

User Engagement and Usability. The performer is expected to incorporate regular engagement with
designated users and stakeholders to assess the usability of the evolving capability, including workflow
continuity, navigation, access to mission functions, and movement among integrated applications. User
feedback and usability findings should inform iterative refinement of the prototype and prioritization of
enhancements.

Issue Management. The performer is expected to maintain visibility of identified usability concerns,
defects, integration challenges, security findings, performance issues, and other risks. The approach
should support prioritization, ownership, resolution tracking, and timely communication of issues that
could affect mission operations, prototype objectives, or the planned evaluation.

Security Authorization. Security authorization must be addressed as an integral part of the prototype
rather than as a final-phase activity. The performer is responsible for developing and implementing the
security approach; producing the required authorization documentation and evidence; and addressing
identified security gaps or remediation actions necessary to support the Government’s authorization
process. A successful prototype will achieve an Authorization to Operate (ATO).

4.1.  PHASE 1 – DISCOVERY, USER EXPERIENCE, AND TECHNICAL
BASELINE

The vendor shall conduct discovery activities to define the initial prototype scope, user needs assessment,
user roles, priority workflows, system dependencies, and integration constraints for eApp, IEP, PVQ, and
PDT. The vendor shall also assess the anticipated interface, workflow, and onboarding considerations for
the additional DCSA applications to ensure the solution architecture can accommodate them. Within the
first 30 days of Phase 1, the vendor will assume responsibility for sustaining the identified IE applications
and associated integrations. The vendor will retain that responsibility for the remainder of the prototype
period while supporting prototype discovery, development, integration, testing, demonstration, and
evaluation activities.

Key outcomes:

  Defined user personas, role and attribute-based access needs, and priority mission workflows.

  Initial user-experience designs, including a common landing page/dashboard and role-based
navigation.

  Integration inventory and interface strategy for the IE applications.

 6

DCSA INNOVATION CALL #01

  Preliminary onboarding strategy for the additional DCSA applications.

  Prototype architecture, security approach, test plan, backlog, and measurable success criteria.

  Sustainment transition completed for the identified IE applications and associated integrations,
with responsibility for ongoing application operations established.

  Documented application sustainment baseline, including known issues, dependencies, planned
releases, and operational risks relevant to the prototype.

 4.2.  PHASE 2 – CORE SOLUTION PROTOTYPE

The vendor shall develop a functional prototype that provides a common entry point for authorized users.
The prototype shall demonstrate a consistent user interface, role and attributes-based navigation, and
access to selected IE application functions without requiring users to independently login, locate or
navigate among separate applications as depicted below:

Figure  1  -  DCSA Unified Application Architecture

Key outcomes:

  The solution must support DoW zero-trust guidelines with single sign-on through the
organization’s approved identity providers, allowing users to access authorized applications and
services without repeatedly entering separate usernames and passwords.

 7

DCSA INNOVATION CALL #01

  The solution must support multiple identity and access management service providers that
include multiple MFA solutions (e.g., CAC/PIV, ECA, and other MFA approaches)

  Common landing page or dashboard.

  User, user type, role, permissions, attributes, data/resources-based navigation and access
controls.

  Display of approved user information, such as assigned work, recent activity, notifications, and
system announcements.

  Initial integration patterns and connectivity to selected IE applications.

  Demonstration of a unified user experience across at least one end-to-end workflow.

  A modular integration approach that supports future incorporation of all DCSA applications. The
prototype should validate the intended hub-and-spoke model in which the solution provides a
unified experience while underlying applications and services continue to perform their assigned
functions.

  The solution must conform to the established design system to ensure consistent visual
presentation and interaction patterns; support accessibility and usability requirements; and
promote the reuse of approved components across the platform.

4.3.  PHASE 3 – IE APPLICATION ONBOARDING AND WORKFLOW
VALIDATION

The vendor shall onboard the initial IE application set: eApp, IEP, all DCSA required forms (e.g. standard
forms, PVQ, DD254, etc.) and PDT. These applications shall be the first set of applications to reside within
and be accessed through the solution. The vendor shall maintain each application in an operational state
throughout its integration and transition activities.

Key outcomes:

  eApp, IEP, DCSA required forms, and PDT accessible through the solution in accordance with
authorized user roles.

  Validated handoffs between the solution and underlying IE applications or services.

  Selected cross-application workflows demonstrated and tested with representative users.

  User-context continuity, to the extent technically feasible and approved, when transitioning
among integrated applications.

  Documented operational impacts, integration issues, and recommendations for production
implementation.

  Reusable onboarding patterns, interface specifications, and lessons learned for subsequent
applications.

 8

DCSA INNOVATION CALL #01

4.4.  PHASE 4 – PROTOTYPE VALIDATION, SECURITY
AUTHORIZATION, AND PRODUCTION READINESS

Working with the DCSA Test and Evaluation (T&E) team, the vendor will support the testing and
assessment activities needed to confirm that the prototype performs as intended across integrated IE
applications and representative mission workflows.

Testing may include development testing, automated testing, regression testing, integration testing,
Government Acceptance Testing (GAT), and User Acceptance Testing (UAT), as appropriate. User
feedback will continue to inform final refinements; however, the primary purpose of this phase is to
assess prototype viability, verify performance against established measures, complete security
authorization activities, and determine readiness for production transition.

The vendor will address or document identified issues, complete required security documentation and
remediation activities, and support the Government’s process for obtaining an Authorization to Operate
(ATO). The phase will also identify remaining risks, operational impacts, and production-transition
considerations, including an estimated cost for scaling and sustaining the capability beyond the prototype
period.

Key outcomes:

  Prototype viability assessment against defined success criteria, performance measures, security
requirements, and representative mission workflows.

  GAT, UAT, regression, integration, performance, reliability, accessibility, and security test results,
as applicable.

  Security authorization documentation, evidence, and remediation activities necessary to support
achievement of an ATO.

  Documented disposition of identified defects, usability findings, integration issues, security
findings, and operational risks.

  Final prototype design and prioritized enhancement backlog.

  Production-readiness assessment and recommendation for production transition.

  Phased production implementation approach and rough-order-of-magnitude cost estimate for
deployment, operations, sustainment, and future application onboarding.

 9

DCSA INNOVATION CALL #01

5. GOVERNMENT FURNISHED INFORMATION/DATA/
PROPERTY

The Government will provide

  Access to production applications, datasets, and architecture.

  Access to above noted applications and supporting applications including JIRA, Confluence,
Gitlab, Antifactory, and ServiceNow.

  Access to relevant system APIs, data dictionaries, and business rule documentation will also be
provided.

  Access to DCSA design pattern library and ecosystem.

  Relevant agency regulations, policies, and procedures;

  Common Access Credential (CAC)

  Licenses (If required)

  IT Equipment required to access the Government provided environments. This equipment will
include Laptop computers for work requiring DCSA network access.

The Government will not provide

  hardware or software licenses outside of the established DCSA IL5 AWS environment.

Use of government data and PII handling will be in accordance with privacy policies and protections to
include responsible AI training. Use of data in AI models must comply with the Unbiased AI Principles of
EO 14319 and OMB M-26-04. DCSA retains absolute ownership of all ingested data, curated data
products, fine-tuned model weights, and custom embeddings. The Contractor is explicitly prohibited from
utilizing Enterprise data to train, evaluate, or enhance external commercial foundation models or
proprietary algorithms.

6. SECURITY CONSIDERATIONS

 The vendor shall comply with all DCSA security regulations and operational security (OPSEC) constraints:

Clearance Requirements: The following requirements have to be met at time of solution concept paper
submission: The Performer shall possess and maintain an active Top Secret Facility Clearance (FCL). All
assigned personnel shall be Citizens of the United States and have at least an interim Secret clearance.

Privileged Users: Prior to being granted administrative capabilities (privileged user) in a system storing PII,
personnel require a final favorably adjudicated Tier 5 investigation. An interim T5/T5R or Top-Secret
Clearance at time of solution concept paper submission will suffice to start.

The Performer and the individuals must maintain the level of security required for the life of the
agreement. All personnel shall request and obtain a Common Access Credential (CAC) to have logical
access to the Government furnished development, integration and operational environments. The
Performer will ensure that their personnel have the hardware and software necessary to virtually provide
the CAC’s certificate information to the necessary logical environments.

 10

DCSA INNOVATION CALL #01

The Performer will utilize Government Furnished Equipment to access the operational environment.

Data Handling and Compliance:  The Performer shall process, transmit, and store all Controlled
Unclassified Information (CUI) and classified data in strict accordance with 32 CFR Part 117 (NISPOM) and
DoD Manual 5200.01. All official communications shall occur exclusively via approved government or
secure corporate IT networks.

Operational Security (OPSEC):  The Performer is strictly prohibited from releasing project information,
including contract references, classification levels, or clearances, in any public advertisements, websites,
or promotional materials.

7. PERFORMANCE

7.1.  PLACE OF PERFORMANCE

Work will be performed at the Contractor's facility and/or remotely, with required integration and
deployment activities taking place within the government- provided DCSA IL5 cloud environment.

The Contractor may be required to attend site visits to the following locations as part of the discovery,
development, or deployment efforts outlined above.

  RKB, 27130 Telegraph Road, Quantico, VA 22134

  DCSA, 7556 Teague Road, Suite 500, Hanover, MD 21076

  DCSA, 7740 Milestone Pkwy, Suite 100, Hanover, MD 21076

7.2.  PERIOD OF PERFORMANCE

  Prototype Project:  Six (6)  months broken out into four (4 ) sequential phases , with potential
extension for additional application integration or evaluation based on prototype results, mission
priorities, available resources, and applicable approvals.

  Follow On Production:  After successful prototype completion, the Government expects  to award
a follow-on production OTA or FAR -based contract for scaling, deployment, and operational
sustainment.

8. ATTACHMENTS

1.  DCSA Ecosystem  Style Guide
