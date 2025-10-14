Hangman — GitHub Collaboration Guide (Mobile & Laptop Setup)
Repository: https://github.com/ChamelEvangelista/Hangman
Team Leader / Repo Owner: ChamelEvangelista
This guide explains how to collaborate on the Hangman React Native app whether you’re using a mobile device (Termux + Acode) or a laptop (CMD / VS Code). It includes all the essential steps to connect, clone, create branches, edit, commit, push, and open pull requests.
________________________________________
⚙️ Prerequisites
📱 For Mobile Users (Termux + Acode)
•	Termux installed from F-Droid (not Play Store)
•	Acode installed from Play Store (for editing code)
•	Git installed inside Termux:
•	pkg update && pkg upgrade
•	pkg install git
•	A GitHub account (log in using browser)
💻 For Laptop Users (CMD / VS Code)
•	Git installed (https://git-scm.com/downloads)
•	VS Code installed (https://code.visualstudio.com/)
•	Node.js installed (https://nodejs.org/)
________________________________________
🪪 Step 1 — Accept the Collaboration Invitation
Purpose: You must accept the invitation before pushing code.
1.	Check your GitHub notifications or email for an invite from ChamelEvangelista.
2.	Click Accept invitation.
________________________________________
🔗 Step 2 — Connect to the Repository
📱 For Termux Users:
1.	Open Termux.
2.	Run the following to set up your Git identity (only once):
•	git config --global user.name "Your GitHub username"
•	git config --global user.email "your-email@example.com"
Verify Git works:
•	git --version
💻 For Laptop Users:
1.	Open CMD or VS Code Terminal.
2.	Configure Git identity (once only):
3.	git config --global user.name "Your GitHub username"
4.	git config --global user.email "your-email@example.com"
________________________________________
📥 Step 3 — Clone the Repository (Download the Project)
Purpose: To download a copy of the project to your device.
📱 Termux:
•	cd ~
•	git clone https://github.com/ChamelEvangelista/Hangman.git
•	cd Hangman
Now open the folder in Acode → tap Open Folder → choose Hangman.
💻 CMD or VS Code:
•	cd Documents
# or wherever you want the project
•	git clone https://github.com/ChamelEvangelista/Hangman.git
•	cd Hangman
Open the folder in VS Code by right-clicking → Open with Code.
________________________________________
🌿 Step 4 — Create a New Branch
Purpose: To work on your feature separately from others.
Terminal:
•	git checkout -b feature-yourname-update
Example:
•	git checkout -b EvangelistaChamel
Tip: Each member should use their own branch (e.g. feature-jane-hint-function).
________________________________________
✏️ Step 5 — Edit the Code
•	Open the project folder (Hangman).
•	Edit or add files normally.
•	Save your work.

💾 Step 6: Adding and Committing Changes Safely
⚠️ Important: Avoid using git add .
git add . adds all modified files — including others’ work — which may cause merge conflicts or overwrite your teammates’ progress.
Instead, only stage specific files you’ve worked on.
1.	Check which files you changed:
•	git status

2.	Add only your files:
•	git add path/to/your/file.js
	Example:
•	git add App.js

3.	Commit with a meaningful message:
•	git commit -m "feat(login): added login validation"

4.	If you accidentally staged all files:
•	git reset
Then re-add only your files using the git add command above.

☁️ Step 7 — Push Your Branch to GitHub
Purpose: Upload your code changes to the shared repository.
Terminal:
•	git push -u origin feature-yourname-update
If asked for credentials, use your GitHub username and Personal Access Token instead of password (GitHub no longer supports password pushes).
Tip: Generate a token from GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → New token → Check repo → Copy token → use it as your password.
________________________________________
🔁 Step 8 — Open a Pull Request (PR)
Purpose: Ask the leader to review and merge your work.
1.	Go to: https://github.com/ChamelEvangelista/Hangman
2.	Click Compare & pull request.
3.	Add a short title and description:
o	What you changed.
o	Why it’s needed.
4.	Click Create pull request.
________________________________________
📤 Step 9 — Update Your Local Code (Sync with Main)
Purpose: Always stay updated before starting new work.
Terminal:
•	git checkout main
•	git pull origin main
Tip: Do this before creating new branches to prevent conflicts.
________________________________________
🔧 Step 10 — Fix Merge Conflicts (If Any)
If you see messages like “merge conflict”, it means someone edited the same lines.
📱 or 💻 (same steps):
1.	Open the conflicting files (Git will mark them with <<<<<<< and >>>>>>>).
2.	Manually decide which code to keep.
3.	Save the file.
4.	Run:
•	git add filename
•	git commit -m "Resolved merge conflict"
•	git push
________________________________________
📘 Quick Summary (Cheat Sheet)
Action	Termux / CMD Command	Description
Clone repo	git clone <repo-link>	Download project from GitHub
Create branch	git checkout -b feature-name	Make a new branch for changes
Stage files	git add filename	Prepare files for commit
Commit	git commit -m "message"	Save changes with message
Push	git push origin branch-name	Upload changes to GitHub
Pull	git pull origin main	Update your local code
Switch branch	git checkout branch-name	Move between branches
________________________________________
✅ Best Practices
•	Always pull before pushing.
•	Never edit directly in main branch.
•	Use clear commit messages.
•	Push often to avoid data loss.
•	If you’re unsure, message the leader first.
