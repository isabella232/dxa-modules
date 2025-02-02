RWS Digital Experience Accelerator Modules
===
Build status
------------
### Java
- Develop: ![Build Status](https://github.com/sdl/dxa-modules/workflows/build_java/badge.svg?branch=develop)
- 1.8: ![Build Status](https://github.com/sdl/dxa-modules/workflows/build_java/badge.svg?branch=release/1.8)

### NET
- Develop: ![Build Status](https://github.com/sdl/dxa-modules/workflows/build_dotnet/badge.svg?branch=develop)
- 1.8: ![Build Status](https://github.com/sdl/dxa-modules/workflows/build_dotnet/badge.svg?branch=release/1.8)

### GUI
- Develop ![build Status](https://github.com/sdl/dxa-modules/workflows/build_GUI/badge.svg?branch=develop)

Prerequisites
-------------
For building .NET modules you must have the following installed:
- Visual Studio 2019
- .NET Framework 4.6.2

For building Java modules you must have the following installed:
- Maven 3.2+
- Maven should be available in the system PATH

Build
-----
For building .NET modules: see readme in webapp-net

For building Java modules: `cd webapp-java; mvn install`

About
-----
The RWS Digital Experience Accelerator (DXA) is a reference implementation of SDL Tridion Sites 9 and SDL Web 8 intended to help you create, design and publish an SDL Tridion/Web-based website quickly.

DXA is available for both .NET and Java web applications. Its modular architecture consists of a framework and example web application, which includes all core SDL Tridion/Web functionality as well as separate Modules for additional, optional functionality.

This repository contains the source code of all the DXA Modules maintained by SDL. 

The Module distributions (including Content Manager-side items and installation support) are downloadable from the [SDL AppStore](https://appstore.sdl.com/list/?search=dxa) or the [Releases in GitHub](https://github.com/sdl/dxa-modules/releases).


Support
---------------
At RWS we take your investment in Digital Experience very seriously, if you encounter any issues with the Digital Experience Accelerator, please use one of the following channels:

- Report issues directly in [this repository](https://github.com/sdl/dxa-modules/issues)
- Ask questions 24/7 on the SDL Tridion Community at https://tridion.stackexchange.com
- Contact RWS Professional Services for DXA release management support packages to accelerate your support requirements


Documentation
-------------
Documentation for most of the SDL DXA Modules can be found online in the SDL documentation portal: https://docs.sdl.com/sdldxa


Repositories
------------
You can find all the DXA related repositories [here](https://github.com/sdl/?q=dxa&type=source&language=)


Branches and Contributions
--------------------------
We are using the following branching strategy:

 - `develop` - Represents the latest development version.
 - `release/x.y` - Represents the x.y Release. If hotfixes are applicable, they will be applied to the appropriate release branch so that the branch actually represents the initial release plus hotfixes.

All releases (including pre-releases and hotfix releases) are tagged. 

If you wish to submit a Pull Request, it should normally be submitted on the `develop` branch so that it can be incorporated in the upcoming release.

Fixes for severe/urgent issues (that qualify as hotfixes) should be submitted as Pull Requests on the appropriate release branch.

Always submit an issue for the problem, and indicate whether you think it qualifies as a hotfix. Pull Requests on release branches will only be accepted after agreement on the severity of the issue.
Furthermore, Pull Requests on release branches are expected to be extensively tested by the submitter.

Of course, it is also possible (and appreciated) to report an issue without associated Pull Requests.

DXA Builder
-----------
The current DXA Builder is available in Maven Central, and the latest DXA Builder is also available as a public snapshot.

If you have not configured a snapshot repository and don't want to, you may need to install the DXA Builder locally in order to run the SNAPSHOT. 

To install it, run the wrapper script of the `dxa-builder` project: `gradlew(.bat) publishLocal` 
On Windows, you can also just run `get-started.cmd` script at first run.

Snapshots
---------
DXA publishes SNAPSHOT versions to Sonatype. To use them, configure `https://oss.sonatype.org/content/repositories/snapshots` as a repository in your Maven settings. Read [this](https://maven.apache.org/settings.html#Repositories) for instructions.

License
-------
Copyright (c) 2014-2021 SDL Group.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
