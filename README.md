# SUDAI Youth Wing Camp 2025 - Registration App

This is a Google Apps Script web application for managing delegate registration for the SUDAI Youth Wing Camp 2025.

## How to Set Up and Deploy

Follow these steps carefully to get the application running.

### Step 1: Set Up Your Google Sheet

1.  Create a new Google Sheet in your Google Drive. You can name it "SUDAI Camp Registration 2025".
2.  This sheet will act as your database. It needs two tabs (sheets) at the bottom. Rename them exactly as follows:
    *   `Pins`
    *   `Registrations`

3.  **Set up the `Pins` sheet:**
    *   In the first row, create the following headers in cells A1, B1, C1, and D1:
    *   `Phone`
    *   `PIN`
    *   `Date Generated`
    *   `Used?`

4.  **Set up the `Registrations` sheet:**
    *   In the first row, create the following headers from cell A1 to J1:
    *   `Name`
    *   `Phone`
    *   `PIN`
    *   `Gender`
    *   `Address`
    *   `Zone`
    *   `Branch`
    *   `Status`
    *   `Email`
    *   `Timestamp`

### Step 2: Create the Google Apps Script Project

1.  With your Google Sheet open, go to the menu and click `Extensions` > `Apps Script`.
2.  This will open a new Apps Script project that is linked to your sheet.
3.  You will see a default `Code.gs` file. Delete the content inside it.
4.  You will also see some other files. You can delete them by clicking the three dots next to the file name and selecting `Delete`.
5.  I have already prepared the code for you. You will need to copy the contents of the files I provide into your Apps Script project.
    *   Copy the contents of `Code.gs` into the `Code.gs` file in your project.
    *   Click the `+` icon in the `Files` sidebar and choose `HTML` to create a new HTML file. Name it `index.html` (make sure to include the `.html` extension if prompted). Copy the contents of the `index.html` file I provided into it.
    *   Repeat this process to create `admin.html` and `register.html`, copying the corresponding file contents.

### Step 3: Set Your Admin Key

For the admin panel to work, you need to set a secret key that prevents unauthorized users from generating PINs.

1.  In the Apps Script editor, click on the `Project Settings` (gear icon) on the left sidebar.
2.  Scroll down to the `Script Properties` section and click `Add script property`.
3.  In the `Property` field, enter `ADMIN_KEY` (it must be exactly this name).
4.  In the `Value` field, enter a secret password or key that you will use on the admin page. For example: `MySecretAdminKey123`.
5.  Click `Save script properties`.

### Step 4: Deploy the Web App

The final step is to publish your script as a web app that people can visit.

1.  At the top right of the Apps Script editor, click the `Deploy` button and select `New deployment`.
2.  Click the `Select type` (gear icon) on the left and choose `Web app`.
3.  In the `Description` field, you can add a note, like "Initial version".
4.  For `Execute as`, select `Me (your-email@gmail.com)`.
5.  For `Who has access`, select `Anyone`. **This is important!** It means anyone with the link can view the registration form. It does not mean anyone can see your data.
6.  Click `Deploy`.
7.  Google will ask you to `Authorize access`. Click the button and follow the prompts to grant the script permission to access your Google Sheet.
    *   You might see a "Google hasn't verified this app" warning. This is normal for personal scripts. Click `Advanced`, and then click `Go to <Your Project Name> (unsafe)`.
    *   Review the permissions and click `Allow`.
8.  After authorizing, a `Deployment successful` window will appear with your **Web app URL**. Copy this URL.

This URL is the public link to your registration application! You can share it with others. The links for the admin and register pages will work from this main URL.
