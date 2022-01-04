# Intelligent-Grouping-App
![Intelligent Grouping Logo](/static/images/blue-bg.svg)
## Overview:
The Intelligent Grouping web application is a website designed to provide teachers with the tools to group their students together for various classroom purposes, with a high degree of customizability and ease-of-use.
## Features:
* Easy Google authentication for sign in.
* Import class rosters through a .CSV file upload (follows Infinite Campus' format).
* Manually create class rosters through an input system.
* Generate random groupings of a specified number of groups or group size.
* Exclude users from a group in case of absence or other purposes (like TAs)
* Input user preferences through automatically generated forms
* Easy-to-find utorial in the top right corner of all screens, accessible by a single click
## Instructions:
* After the website finishes loading, simply press the "Sign in with Google" button and sign in using whatever email you wish, keeping in mind that that email is your account for this website.
  * Currently only naperville203.org organization emails are permitted
* To add classes, simply click the "Add Class" button in the bottom left of the screen.
  * For manual entry, click the manual entry button in the popup and input your students one by one. Afterward, click "save" to save the completed manual class.
  * For automatic fill in with a .CSV file, click "Import Class Roster" on the popup and select the desired CSV file from Infinite Campus to add your classes. This works with CSV files exported form infinite campus. 
  * To edit classes, select a class from the sidebar and then click the pencil icon, and the manual entry form will pop up, allowing you to change values.
  * To delete classes, select a class from the sidebar and then click the trash can icon.
* Instructions for basic random groups.
  * Click the desired class in the sidebar.
  * In the panel, select "Create grouping".
    * In case somebody is absent or otherwise not supposed to be put into a group, like for example if they are a teacher's assistant, click their name on the right sidebar, and then click the red outlined section of that sidebar. This will place them within the exclusion category and exclude them from groupings. Doing the reverse will reverse this exclusion.
  * Click the large plus button in the main canvas to add a grouping.
  * Click the "Arrange Students" button.
  * Select "Random Grouping".
  * Input the desired parameters (amount of groups made or people per group).
  * Submit your response.
* Instructions for setting up preferences and sending out forms
  * Click on the desired class in the sidebar.
  * On the rightmost panel, click "Add Choice."
    * For each choice setting you add, there will be more items added to the automatically generated forms that you can send to your students.
  * Select a choice of grouping type.
    * Preferred students allows students to choose who they wish to be paired up with
    * Unpreferred students allows students to choose who they think they cannot work well with easily
    * Preferred topic is applicable when each group will be covering a different topic, and allows them to choose what they would rather learn/talk about.
    * Unpreferred topic is the same as preferred topic but for topics they do not want to learn about.
  * Input a description for the context for which these preferences are being asked for (in case of people wanting to work with others in certain contexts, or different events requiring different sets of topics), followed by the number of choices the student can make (ranking people).
    * For topic preferences, there are additional steps in the form of adding the name of the topics in question. To set up choices for topics, type in the names for each followed by a new line.
  * After entering all necessary information, click "add choice" and a new option should pop up on the preferences panel on the class screen.
  * If necessary, pressing the x button can remove a preference choice.
  * To send out forms, simply click "copy form link" at the bottom right and then paste the link to somewhere where anyone can access and click it.
* Instructions for students to fill out the forms
  * Enter your student ID into the Student ID field on the form.
  * Use the dropdown menus to rank other students and topics in the order in which you would rather not or would rather have as a part of your group.
  * Submit the form.
* Instructions for those who wish to use their newly generated preferences.
  * Follow the same steps as the steps for random grouping until you get to the "Choose an Arrangement" prompt.
  * Instead of selecting "random groupings" select "preferences" and fill out the information shown, i.e. either the amount of desired groups or the number of people in each group.
  * The groups will be automatically generated just like in random generation, after clicking "submit."
## Internal Configuration (gene.js):
* In the aformentioned file, there are options provided to allow for adjustment of the genetic algorithm for tuning purposes.
  * Quarter Size: 
    * Since the algorithm works with sections as small as one quarter of the population, this is how you set up the population size of each generation. As can be inferred by the name, this is 1/4th the amount of groupings you want per generation.
  * Free Iterations:
    * This genetic algorithm uses a simplified escape condition that stops upon reaching a certain amount of failures (i.e. generations without improvement), but also has a fixed number of generations which the alogirthm is allowed to run unimpeded (i.e. without counting the amount of failures). Adjust this number to adjust the amount of iterations the algorithm goes before counting.
  * Escape Iterations:
    * As mentioned for Free Iterations, the escape condition for the algorithm is a certain amount of failures in a row after a certain amount of iterations. This is that "certain amount of failures in a row." Adjust this to change that value.
  * Mutation Probability:
    * In order to introduce more variety and diversity into the population, a random amount of generations in a bred grouping get mutated before the next scoring round, and this value is the probability of any given grouping being chosen to be mutated.
  * Mutation Proportion:
    * In order to determine how much you change per mutation, this value is used to calculate the amount of pairs to swap in order to get as close to this value difference between the original grouping and the final grouping after mutation.
  * Student Like Base:
    * Scoring algorithm is done based on an exponential and summative formula, where each student in a like/dislike list increments/decrements the total score by a specific numerical base (student like base for this case since this is for the like list) to the total amount of students in the like/dislike list minus the ranking (descending order starting from zero as 1st place)th power.
  * Student Dislike Base:
    * Same concept as Student Like base except this is done for the amount decremented per student found in the dislike list.
## Known Issues
* Genetic Algorithm is not fine-tuned yet, so it may not be perfect or accurate enough to satisfy everything, but it does at least work slightly better than randomization at this point.
* "Topic" is an option in preferences but does not exist in the actual application yet.
## Remaining User Stories
* As a teacher, I want to be able to save student groups so that I can see a history of who everyone has been with and regroup based on past grouping activities arrangements so that they can interact with different members of the class
* I want to be able to collect not only student preferences but also preferred roles within each group
* As a teacher, I want to to be able to upload multiple file types of class rosters
* As a teacher, I want to be able to access and use the site across multiple platforms and screen resolutions
### Production Server Deployment
1. Create a new EC2 instance used on Ubuntu.
2. Open ports for HTTP and HTTPS when walking through the EC2 wizard.
3. Generate a key pair for this EC2 instance. Download and save the private key, which is needed to connect to the instance in the future.
4. After the EC2 instance is running, click on the Connect button the EC2 Management Console for instructions on how to ssh into the instance.
5. On the EC2 instance, [install](https://github.com/nodesource/distributions/blob/master/README.md) Node.js v12

```
curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

6. On the EC2 instance, install nginx: `sudo apt-get -y install nginx`
7. Create a reverse proxy for the Intelligent Grouping App node server. In the file /etc/nginx/sites-enabled/intelligentgrouping:

```
server {
	# listen on port 80 (http)
	listen 80;
	server_name intelligentgrouping.nnhsse.org;

	# write access and error logs to /var/log
	access_log /var/log/intelligentgrouping_access.log;
	error_log /var/log/intelligentgrouping_error.log;

	location / {
		# forward application requests to the node server
		proxy_pass http://localhost:8080;
		proxy_redirect off;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	}
}
```

8. Restart the nginx server: `sudo service nginx reload`
9. Install and configure [certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)
10. Clone this repository from GitHub.
11. Inside of the directory for this repository install the node dependencies: `npm install`
15. Update the .env file:

```
DBPASS=!!!
CLIENT_SECRET=!!!
CLIENT_ID=!!!
PORT=8080
```

16. Update Google Cloud Platform is allow connections from new domain (intelligentgrouping.nnhsse.org)
17. Install Production Manager 2, which is used to keep the node server running and restart it when changes are pushed to master:

```
sudo npm install pm2 -g
sudo pm2 --name intelligentgrouping start index.js
```

18. Verify that the node server is running: `sudo pm2 list`
19. Configure pm2 to automatically run when the EC2 instance restarts: `sudo pm2 startup`
20. Add a crontab entry to pull from GitHub every 15 minutes: `crontab -e`

```
*/15 * * * * cd /home/ubuntu/Intelligent-Grouping-App && git pull
```

21. Restart the node server: `sudo pm2 restart index`