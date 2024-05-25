# GitHelper

GitHelper is a Visual Studio Code extension that assists users with Git commands and terminal issues. It offers two modes of operation: one that uses the OpenAI API and another that utilizes a locally trained DistilBERT model hosted on a Flask server. Users can switch between the two modes by renaming the extension files.

## Features

- Provides Git command assistance based on your Git repository's current state.
- Analyzes terminal output and suggests solutions for issues.
- Supports both OpenAI API and a locally hosted DistilBERT model for generating responses.

## Prerequisites

- Visual Studio Code
- Node.js and npm
- Python and pip
- Required Python libraries: `flask`, `transformers`, `torch`, `pdf2image`
- Poppler for PDF processing

## Setup

1. **Install Poppler:**

   - For macOS: `brew install poppler`
   - For Ubuntu/Debian: `sudo apt-get install poppler-utils`
   - For Windows: [Download Poppler](http://blog.alivate.com.au/poppler-windows/) and add the `bin` directory to your system's PATH.

2. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/GitHelper.git
   cd GitHelper
   ```

3. **Install VS Code dependencies:**

   ```sh
   npm install
   ```

4. **Install Python dependencies:**

   ```sh
   pip install flask transformers torch pdf2image
   ```

5. **Set up environment variables:**

   Create a `.env` file in the root of the project and add your OpenAI API key (if using the OpenAI mode):

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Flask Server

If you choose to use the locally hosted model, you need to run the Flask server:

1. Lets set it up!

2. **Run the server:**

   ```sh
   python server.py
   ```

## Using the Extension

1. **Switching between OpenAI API and local model:**

   - **OpenAI API**: Rename `extension.ts` to `extension_active.ts` and `extensionusingthemodel.ts` to `extension.ts`.
   - **Local Model**: Rename `extension.ts` to `extensionusingthemodel.ts` and `extension_active.ts` to `extension.ts`.

2. **Install and Run the Extension:**

   - Open the project in Visual Studio Code.
   - Press `F5` to start debugging. This will open a new VS Code window with the extension loaded.
   - Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run the command `Help With Git`.

## Commands

- `Help With Git`: Provides assistance with Git commands and terminal output analysis.
- `Send Terminal Command`: Sends a command to the terminal and captures the output.

## Usage

1. **Help With Git Command:**

   - Run the command `Help With Git`.
   - The extension will show your Git repository's information.
   - You can ask a Git-related question or type "check terminal" to analyze the last terminal command output.

2. **Send Terminal Command:**

   - Run the command `Send Terminal Command` and input your command.
   - The command will be executed in the terminal, and the output will be logged for analysis.

## Contributing

Feel free to submit issues and pull requests to improve the extension. Your contributions are always welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

By following the above instructions, you can easily switch between using the OpenAI API and the locally hosted DistilBERT model to get assistance with Git commands and terminal issues directly within Visual Studio Code.
