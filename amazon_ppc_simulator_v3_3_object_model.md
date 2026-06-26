# Amazon PPC Training Simulator V3.3 Object Model

## Core advertising hierarchy

```text
Portfolio
  -> Campaign
      -> Ad group
          -> Product ad
          -> Target
              -> Search term row, when applicable
          -> Negative targeting row
      -> Budget rule
      -> Creative, for SB and SD
      -> Structured history row
```

## Campaign

Primary fields:

- id
- type: SP, SB, or SD
- name
- portfolio
- status
- dailyBudget
- startDate
- endDate
- targetingMode
- adFormat
- bidStrategy
- defaultBid
- products
- placements
- metrics

Child collections:

- adGroups
- ads
- targets
- searchTerms
- negatives
- budgetRules
- history

SB and SD campaigns also use:

- creative
- creativeStatus
- creativeIssue

## Ad group

Primary fields:

- id
- campaignId
- name
- status
- defaultBid

Rules:

- Every campaign must have at least one ad group.
- Every ad group must point to its parent campaign.
- Archived campaigns cascade archive status to ad groups.

## Product ad

Primary fields:

- id
- campaignId
- adGroupId
- asin
- status
- name

Rules:

- Every product ad must point to a valid campaign.
- Every product ad must point to a valid ad group under the same campaign.
- Every product ad ASIN must exist in the mock product catalog.

## Target

Primary fields:

- id
- campaignId
- adGroupId
- type
- value
- match
- bid
- status
- metrics

Target types include:

- Auto
- Keyword
- ASIN
- Category
- Audience

Rules:

- Every target must point to a valid campaign.
- Every target must point to a valid ad group under the same campaign.
- Every target must have a bid greater than zero.
- SP automatic campaigns should include Close match, Loose match, Substitutes, and Complements.

## Search term row

Primary fields:

- id
- campaignId
- adGroupId
- targetId
- term
- target
- recommendation
- metrics

Rules:

- Search term rows belong to SP and SB workflows.
- SD campaigns should not use search term rows.
- Search term rows should link to a target when a match exists.

## Negative targeting row

Primary fields:

- id
- campaignId
- adGroupId
- type
- value
- sourceSearchTermId

Rules:

- Negative rows must point to a valid campaign.
- Negative rows must point to a valid ad group.
- Duplicate negative type plus value combinations are flagged.

## Budget rule

Primary fields:

- id
- campaignId
- name
- type
- increase
- condition
- status

Rules:

- Budget rules must point to a valid campaign.
- Training-safe increase range is 1 percent to 200 percent.

## Creative object

Used by SB and SD campaigns.

Primary fields:

- headline
- brandName
- logo
- destination
- video
- image

Rules:

- SB Product Collection needs at least three products.
- SB Store Spotlight should use Brand Store destination.
- SB Video needs a video placeholder.
- Rejected SB or SD creative blocks safe enablement.

## V3.3 navigation drill model

```text
NavigationDrill
  -> NavigationStep
      -> Expected selector
      -> Completion predicate
      -> Coach hint
  -> NavigationDrillResult
      -> Trainee
      -> Score
      -> Mistakes
      -> Skips
      -> StartedAt
      -> CompletedAt
```

## NavigationDrill

Primary fields:

- id
- type
- title
- difficulty
- minutes
- summary
- route
- steps

## NavigationStep

Primary fields:

- id
- label
- instruction
- selector
- allowSelectors
- done predicate
- coach

Rules:

- Only the current step selector is treated as the correct click.
- Optional allowSelectors support safe inputs needed before the main click.
- Wrong clicks are blocked and recorded.
- Skips are allowed but penalized.

## NavigationDrillResult

Primary fields:

- drillId
- title
- trainee
- score
- mistakes
- skips
- startedAt
- completedAt

Rules:

- Results are stored in LocalStorage.
- Results appear in Trainer dashboard.
- Results export with the trainer log CSV.

## V3.3 state fields

- activeNavigationDrillId
- navigationDrillStep
- navigationDrillMistakes
- navigationDrillSkips
- navigationDrillLog
- navigationDrillResults
- navigationDrillStartedAt
- navigationDrillCompleted
