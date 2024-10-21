# AutoInstaling

AutoInstaling is a Node.js application that automates completing language learning sessions on [Instaling](https://instaling.pl/teacher.php?page=login). This program logs in to your account and runs the session automatically. The app is customizable via `credentials.json` and can be packaged into an executable file for easier use.

## Features

- Automates language learning sessions on Instaling.pl.
- Customizable via `credentials.json` for easy configuration.
- Learn new words as they are stored in the `words.txt` file.
- Can be run directly with Node.js or packed as a standalone executable.

## Prerequisites

- Node.js must be installed if you plan to run the app directly.
- If you wish to run it as an executable, you can use `pkg` to package the app.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/fishinmycola/AutoInstaling.git
    ```

2. Navigate into the project directory:

    ```bash
    cd AutoInstaling
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

4. Edit the `credentials.json` file with your Instaling credentials:

    ```json
    {
    "login": "yourlogin",
    "password": "yourpassword",
    "sessionCount": 1
   }
    ```

## Usage

### Running with Node.js

You can start the program by executing `start.bat` on Windows or running the following command:

```bash
node AutoInstaling.js
