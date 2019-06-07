# Mobile Web Specialist Certification Course
---

## Restaurant Reviews: Stage 3
  A Progressive Web App that shows restaurants in your neighborhoods and their reviews. Works for all types of browser and it completely  responsive on all devices to provide rich user experience to all the users

### Contents
  1. [Getting Started](getting-started)
  2. [Features](features)
  3. [Twitter Posts](twitter-posts)

### Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

#### Prerequisites

1. [npm]()
2. [Nodejs](https://nodejs.org/en/download/)

#### Installation

**Client**
1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

   Then Run `npm run build` to generate the build folder before running the project.

   In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

**Server**

To run the server please clone [this](https://github.com/twishasaraiya/mws-restaurant-stage-3) repository

### Features

 - [x] Maintains Responsive Design on different devices
 - [x] Accessibility Features(semantic elements, ARIA attributes)
 - [x] Allow Users to mark restaurant as Favorite
 - [x] Use IndexedDB to cache data for offline user
 - [x] Service Worker registered
 - [x] LightHouse Score
 ![LightHouse Score](https://github.com/twishasaraiya/mws-restaurant-app/blob/master/screenshots/Screenshot%20(38).png)

### Twitter Posts

- [Accessibility and Responsiveness](https://twitter.com/SaraiyaTwisha/status/1007183566634184704)
- [Testing Site](https://twitter.com/SaraiyaTwisha/status/1013012669127954434)
- [**First Stage Completed**](https://twitter.com/SaraiyaTwisha/status/1013712600947978241)
- [Add Custom Offline Page](https://twitter.com/SaraiyaTwisha/status/1014004158658170881)
- [Lazy Loading Images](https://twitter.com/SaraiyaTwisha/status/1014381582629695488)
- [Set Up Stage 2 Server](https://twitter.com/SaraiyaTwisha/status/1023929913139777536)
- [Improved Performance](https://twitter.com/SaraiyaTwisha/status/1024321043668844544)
- [Diving Into Gulp](https://twitter.com/SaraiyaTwisha/status/1025392697836748807)
- [Progress So far](https://twitter.com/SaraiyaTwisha/status/1026521173713141760)
- [Taming IndexedDB](https://twitter.com/SaraiyaTwisha/status/1027132448260481025)
- [**Stage 2 Completed**](https://twitter.com/SaraiyaTwisha/status/1031922363716300800)

You can view all my posts [here](https://twitter.com/SaraiyaTwisha)
### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
