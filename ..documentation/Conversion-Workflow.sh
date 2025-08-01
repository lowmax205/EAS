#!/bin/bash

# Document Conversion Workflow Script
# Usage: ./Conversion-Workflow.sh
# Prerequisites: pandoc must be installed
# 
# To run this script:
# 1. Open Git Bash terminal
# 2. Navigate to the script directory: cd "d:/Nilo Vscode/EAS/..documentation"
# 3. Make executable: chmod +x Conversion-Workflow.sh
# 4. Run: ./Conversion-Workflow.sh

# Function to find pandoc executable
find_pandoc() {
    # Check if pandoc is in PATH
    if command -v pandoc &> /dev/null; then
        echo "pandoc"
        return 0
    fi
    
    # Common Windows installation paths
    local common_paths=(
        "/c/Users/$USER/AppData/Local/Pandoc/pandoc.exe"
        "/c/Program Files/Pandoc/pandoc.exe"
        "/c/Program Files (x86)/Pandoc/pandoc.exe"
        "/c/tools/pandoc/pandoc.exe"
        "/c/ProgramData/chocolatey/bin/pandoc.exe"
    )
    
    for path in "${common_paths[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    return 1
}

# Find pandoc executable
PANDOC_CMD=$(find_pandoc)
if [ $? -ne 0 ]; then
    echo -e "\033[31m✗ Error: pandoc is not installed or not found\033[0m"
    echo "Please install pandoc from: https://pandoc.org/installing.html"
    echo ""
    echo "Alternative solutions:"
    echo "1. Add pandoc to your PATH in Git Bash:"
    echo "   export PATH=\"/c/Program Files/Pandoc:\$PATH\""
    echo "2. Or install via chocolatey: choco install pandoc"
    echo "3. Or restart VSCode after installing pandoc"
    exit 1
fi

echo "Using pandoc: $PANDOC_CMD"

# Set up directories
sourceDir="./source"
outputDir="./output"
imagesDir="./output/images"

# Create directories if they don't exist
for dir in "$sourceDir" "$imagesDir"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "Created directory: $dir"
    fi
done

# Convert all document types
extensions=("*.docx" "*.doc" "*.html" "*.pdf")

for ext in "${extensions[@]}"; do
    # Use find to get files recursively with the extension
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            # Get relative path
            relativePath="${file#$sourceDir/}"
            
            # Change extension to .md
            outputFile="${relativePath%.*}.md"
            outputPath="$outputDir/$outputFile"
            
            # Get filename without extension for image subdirectory
            filename=$(basename "$file")
            filenameNoExt="${filename%.*}"
            imageSubDir="$imagesDir/$filenameNoExt"
            
            # Create output directory structure
            outputParent=$(dirname "$outputPath")
            if [ ! -d "$outputParent" ]; then
                mkdir -p "$outputParent"
            fi
            
            echo "Converting: $(basename "$file") -> $outputFile"
            
            # Run pandoc conversion
            if "$PANDOC_CMD" "$file" \
                --extract-media="$imageSubDir" \
                --wrap=preserve \
                --markdown-headings=atx \
                --reference-links \
                -o "$outputPath"; then
                echo -e "\033[32m✓ Success: $outputFile\033[0m"
            else
                echo -e "\033[31m✗ Failed: $(basename "$file")\033[0m"
            fi
        fi
    done < <(find "$sourceDir" -name "$ext" -type f -print0)
done

echo -e "\033[36m\nConversion process completed!\033[0m"