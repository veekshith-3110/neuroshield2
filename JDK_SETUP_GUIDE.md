# JDK Setup Guide for Cursor/VS Code

This guide will help you configure your JDK installation in Cursor (or VS Code) for Java and Kotlin development.

## Step 1: Find Your JDK Installation

### Common JDK Locations on Windows:

1. **Oracle JDK:**
   - `C:\Program Files\Java\jdk-XX`
   - `C:\Program Files (x86)\Java\jdk-XX`

2. **OpenJDK:**
   - `C:\Program Files\Eclipse Adoptium\jdk-XX`
   - `C:\Program Files\Microsoft\jdk-XX`

3. **User Directory:**
   - `C:\Users\<YourUsername>\AppData\Local\Programs\Eclipse Adoptium\jdk-XX`
   - `C:\Users\<YourUsername>\jdk-XX`

4. **Custom Location:**
   - Check where you installed it during setup

### How to Find Your JDK:

1. **Using File Explorer:**
   - Open File Explorer
   - Search for "jdk" in C:\ drive
   - Look for folders named like `jdk-17`, `jdk-11`, `jdk-21`, etc.

2. **Using PowerShell:**
   ```powershell
   # Search for JDK installations
   Get-ChildItem -Path "C:\" -Filter "*jdk*" -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
   ```

3. **Check Environment Variables:**
   ```powershell
   $env:JAVA_HOME
   ```

## Step 2: Set JAVA_HOME Environment Variable

### Option A: Using System Properties (Recommended)

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to **Advanced** tab → Click **Environment Variables**
3. Under **System variables**, click **New**
4. Variable name: `JAVA_HOME`
5. Variable value: Path to your JDK (e.g., `C:\Program Files\Java\jdk-17`)
6. Click **OK**

### Option B: Using PowerShell (Current Session Only)

```powershell
# Replace with your actual JDK path
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
```

### Option C: Using Command Prompt (Permanent)

```cmd
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
```

## Step 3: Add JDK to PATH

1. In **Environment Variables** (from Step 2)
2. Find **Path** variable under **System variables**
3. Click **Edit**
4. Click **New**
5. Add: `%JAVA_HOME%\bin`
6. Click **OK** on all dialogs

**Or using PowerShell:**
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;%JAVA_HOME%\bin"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

## Step 4: Verify Installation

Open a **new** PowerShell/Command Prompt window and run:

```powershell
java -version
javac -version
echo $env:JAVA_HOME
```

You should see your Java version information.

## Step 5: Configure Cursor/VS Code

### Update `.vscode/settings.json`

1. Open `.vscode/settings.json` in this project
2. Replace the empty `"java.home"` with your JDK path:
   ```json
   "java.home": "C:\\Program Files\\Java\\jdk-17"
   ```
3. Update `"java.jdt.ls.java.home"` with the same path
4. Update the runtime paths in `"java.configuration.runtimes"`:
   ```json
   "java.configuration.runtimes": [
     {
       "name": "JavaSE-17",
       "path": "C:\\Program Files\\Java\\jdk-17",
       "default": true
     }
   ]
   ```

### Install Required Extensions

In Cursor/VS Code, install these extensions:

1. **Extension Pack for Java** (by Microsoft)
   - Includes: Language Support, Debugger, Test Runner, Maven, etc.

2. **Kotlin Language** (by fwcd)
   - Provides Kotlin language support

3. **Gradle for Java** (by Microsoft)
   - For Android/Gradle projects

### Install Extensions via Command:

```powershell
# Using VS Code CLI (if installed)
code --install-extension vscjava.vscode-java-pack
code --install-extension fwcd.kotlin
code --install-extension vscjava.vscode-gradle
```

## Step 6: Reload Cursor/VS Code

After configuring:
1. Close Cursor/VS Code completely
2. Reopen it
3. Open a Java/Kotlin file to trigger the language server

## Step 7: Verify in Cursor/VS Code

1. Open a `.kt` or `.java` file
2. Press `Ctrl+Shift+P` (Command Palette)
3. Type "Java: Configure Java Runtime"
4. Check that your JDK is detected

## Troubleshooting

### Java not found in terminal:
- Make sure you restarted your terminal after setting PATH
- Verify JAVA_HOME is set: `echo $env:JAVA_HOME`

### Language server not working:
- Check Output panel: View → Output → Select "Language Support for Java"
- Restart the language server: `Ctrl+Shift+P` → "Java: Restart Language Server"

### JDK not detected:
- Verify the path in `settings.json` is correct (use double backslashes `\\`)
- Make sure the path points to the JDK root (not JRE)
- Check that `bin` folder exists inside your JDK path

## Quick Setup Script

Save this as `setup-jdk.ps1` and run it (replace the JDK path):

```powershell
# Set your JDK path here
$jdkPath = "C:\Program Files\Java\jdk-17"

# Set JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, "User")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*%JAVA_HOME%\bin*") {
    $newPath = "$currentPath;%JAVA_HOME%\bin"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✅ Added JDK to PATH"
} else {
    Write-Host "✅ JDK already in PATH"
}

Write-Host "✅ JAVA_HOME set to: $jdkPath"
Write-Host "⚠️  Please restart your terminal and Cursor/VS Code for changes to take effect"
```

## Next Steps

After setup:
1. Open an Android Kotlin file (e.g., `android/HealthApiService.kt`)
2. Cursor should now provide syntax highlighting and IntelliSense
3. You can now build and run Android projects

## Need Help?

If you're still having issues:
1. Check the JDK path is correct
2. Verify JAVA_HOME is set: `echo $env:JAVA_HOME`
3. Restart Cursor completely
4. Check the Output panel for Java language server errors

