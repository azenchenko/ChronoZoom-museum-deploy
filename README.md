ChronoZoom-museum-deploy
========================

Ready to deploy version of ChronoZoom for museums.

Requirements
------------
* SQL Express

Usage
-----

* Make a fork of ChronoZoom. 
* Run `git clone git://github.com/<your-username>/ChronoZoom.git` to clone it to local computer (Case Sensitive). Suppose you downloaded it to `C:/CZ Museum`
* Create a database on your local SQL server
* Open `web.config`, in connection strings locate
```
<add name="Storage" connectionString="Data Source=.\SQLExpress;Initial Catalog=ChronoZoom;Trusted_Connection=True" providerName="System.Data.SqlClient" />
```
and replace values for `Data Source` and `Catalog` with your local SQL Server and database names
* Run ChronoZoom's service locally using IIS:
  - Open command prompt, change directory where IIS or IIS Express is installed. For instance `C:/Program Files (x86)/IIS Express`.
  - Run following command where `/path` is a physical path to folder where you downloaded this repository 
  ```
  issexpress.exe /path:"C:\CZ Museum" /port:2000
  ```
* Open web browser. Go to [http://localhost:2000/sandbox](http://localhost:2000/sandbox) to author data, go to [http://localhost:2000/sandbox?demo_mode=true](http://localhost:2000/sandbox?demo_mode=true) to view museum mode experience

Acknowledgements
----------
ChronoZoom is built and maintained by a growing community, with the support of:

* University of California Berkeley
* Moscow State University
* University of Washington
* Microsoft Research

License
----------
ChronoZoom is made available under the [Apache 2.0 license](blob/master/Source/LICENSE.TXT).

To contribute to the project, please sign a [Contributor's Agreement](http://www.outercurve.org/Participate#Contributing_to_a_project).

[![Outercurve Foundation](http://www.outercurve.org/Portals/0/Skins/CodePlex_NEW/images/footer-logo.jpg)](http://www.outercurve.org/)
