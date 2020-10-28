@echo off
echo This batch file uploads your repository files to Heroku and Github (not including those specified in .gitignore).
echo Are you sure?
pause
echo [ Info ] Uploading...
git push origin master>NUL
echo [ Info ] Pushed files to GitHub.
git push heroku master>NUL
echo [ Info ] Pushed files to Heroku.
echo [ Info ] Finished successfully.
pause