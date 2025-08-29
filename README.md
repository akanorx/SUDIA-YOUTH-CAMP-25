# Registration Web Application (Node.js Version)

This is a self-contained web application for managing delegate registrations using a PIN-based system. This version runs on Node.js and does not require any Google services.

## How to Run This Application

To get this application running on your local computer, you will need to have Node.js installed.

### Step 1: Install Node.js

If you don't already have Node.js, download and install it from the official website:
[https://nodejs.org/](https://nodejs.org/)

Download the **LTS** version, which is recommended for most users. Run the installer and follow the on-screen instructions.

### Step 2: Set Up the Project

1.  Open your computer's terminal or command prompt.
2.  Navigate to the directory where you have saved this project's files.
3.  Once you are in the correct directory, run the following command to install the necessary libraries (like Express.js) that are listed in the `package.json` file:
    ```bash
    npm install
    ```
    This will create a `node_modules` folder in your project directory.

### Step 3: Set Your Admin Key

You need to set a secret key to prevent unauthorized users from generating PINs.

1.  This application looks for an environment variable named `ADMIN_KEY`. You can set it when you run the server. See the next step.

### Step 4: Run the Application

1.  To start the server, run the following command in your terminal. Replace `YourSecretKey123` with the actual secret key you want to use.

    **On macOS and Linux:**
    ```bash
    ADMIN_KEY=YourSecretKey123 npm start
    ```

    **On Windows (Command Prompt):**
    ```bash
    set ADMIN_KEY=YourSecretKey123 && npm start
    ```

    **On Windows (PowerShell):**
    ```bash
    $env:ADMIN_KEY="YourSecretKey123"; npm start
    ```

2.  If it starts successfully, you will see the message: `Server is running on http://localhost:3000`.
3.  Open your web browser and go to **http://localhost:3000**. You should see the welcome page of your application!

The "Admin Panel" and "Register" links will take you to the correct pages, and the application is now running entirely on your machine. To stop the server, go back to your terminal and press `Ctrl + C`.
