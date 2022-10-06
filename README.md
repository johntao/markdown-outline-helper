# markdown-outline-helper

[![Coverage Status](https://coveralls.io/repos/github/johntao/markdown-outline-helper/badge.svg?branch=feat-addCoveralls)](https://coveralls.io/github/johntao/markdown-outline-helper?branch=feat-addCoveralls)

## 1) Intro
### &emsp;&emsp;1.1) A minimal markdown outline helper to convert between list and headings, convert hierarchical list into flat items, and to sort hierarchical items
## 2) Motivation
### &emsp;&emsp;2.1) I use VSCode a lot, and with multi-cursor, I can change almost anything I want in a breeze.
### &emsp;&emsp;2.2) Except for the following cases...
#### &emsp;&emsp;&emsp;&emsp;2.2.1) Generate ordered list with hierarchy prefix (like this --> 3-1; 3-1-2...)
#### &emsp;&emsp;&emsp;&emsp;2.2.2) Convert hierarchical items into flat items (e.g. "  - child" (beneath the "- parent") --> parent/ child)
#### &emsp;&emsp;&emsp;&emsp;2.2.3) Sort child nodes in a hierarchical list
### &emsp;&emsp;2.3) A practice project (node.js, typescript, unit test, vscode extension api...)
#### &emsp;&emsp;&emsp;&emsp;2.3.1) Hence, I didn't do the market research before starting
## 3) Demo
### &emsp;&emsp;3.1) Convert between list and headings
![Convert between list and headings](https://i.imgur.com/sRJL6oc.gif)
### &emsp;&emsp;3.2) Sort hierarchical list  
![Sort hierarchical list](https://i.imgur.com/AmHuDF4.gif)
### &emsp;&emsp;3.3) Convert hierarchical list into flat items
![Convert hierarchical list into flat items](https://i.imgur.com/I1vyAya.gif)
## 4) Proposal
### &emsp;&emsp;4.1) Apply to the outlines where the cursor is located
#### &emsp;&emsp;&emsp;&emsp;4.1.1) Should expand range automatically to match the range of the outlines
#### &emsp;&emsp;&emsp;&emsp;4.1.2) **NO PLANS** to implement multi-selection
#### &emsp;&emsp;&emsp;&emsp;4.1.3) **NO PLANS** to implement multi-block detection
### &emsp;&emsp;4.2) Use simple prompt for user input
#### &emsp;&emsp;&emsp;&emsp;4.2.1) Positional input with hints, one to go
### &emsp;&emsp;4.3) Convert between list and heading (for github readme)
#### &emsp;&emsp;&emsp;&emsp;4.3.1) With customizable indentation
#### &emsp;&emsp;&emsp;&emsp;4.3.2) (Optional) Advanced feature: let user to decide the format (via template)
### &emsp;&emsp;4.4) Convert hierarchical list into flat items
#### &emsp;&emsp;&emsp;&emsp;4.4.1) With customizable delimiter
#### &emsp;&emsp;&emsp;&emsp;4.4.2) Ignore LogSeq tokens, skip block references by default
#### &emsp;&emsp;&emsp;&emsp;4.4.3) Strip off LogSeq hierarchies (i.e. ~~tagA/ tagB/~~ tagC)
#### &emsp;&emsp;&emsp;&emsp;4.4.4) **NO PLANS** to do bi-directional conversion
### &emsp;&emsp;4.5) Sort hierarchical items
#### &emsp;&emsp;&emsp;&emsp;4.5.1) Order by ASC or DESC
#### &emsp;&emsp;&emsp;&emsp;4.5.2) Sort until target level
#### &emsp;&emsp;&emsp;&emsp;4.5.3) Sort without LogSeq tokens
#### &emsp;&emsp;&emsp;&emsp;4.5.4) ------- (Optional) Below items are advanced features -------
#### &emsp;&emsp;&emsp;&emsp;4.5.5) Case-sensitive sort options
#### &emsp;&emsp;&emsp;&emsp;4.5.6) Skip sort on certain items
#### &emsp;&emsp;&emsp;&emsp;4.5.7) Decide which level to sort or not
#### &emsp;&emsp;&emsp;&emsp;4.5.8) Sort with customizable priorities
### &emsp;&emsp;4.6) Code Implementation
#### &emsp;&emsp;&emsp;&emsp;4.6.1) Use Typescript
#### &emsp;&emsp;&emsp;&emsp;4.6.2) Build unit tests
#### &emsp;&emsp;&emsp;&emsp;4.6.3) Should use modular design
### &emsp;&emsp;4.7) Code Deployment
#### &emsp;&emsp;&emsp;&emsp;4.7.1) Should go on marketplace
#### &emsp;&emsp;&emsp;&emsp;4.7.2) Should try GitHub Actions and Codecov
