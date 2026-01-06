# Skill Design Guide

A comprehensive guide for designing complex Agent Skills, based on learnings from the PPTX skill and other well-structured skills in this repository.

## Table of Contents

1. [Skill Architecture Overview](#skill-architecture-overview)
2. [File Structure Patterns](#file-structure-patterns)
3. [Documentation Patterns](#documentation-patterns)
4. [Script Design Patterns](#script-design-patterns)
5. [Workflow Design Patterns](#workflow-design-patterns)
6. [Validation Strategies](#validation-strategies)
7. [Example: PPTX Skill Deep Dive](#example-pptx-skill-deep-dive)
8. [Checklist for Creating New Skills](#checklist-for-creating-new-skills)

---

## Skill Architecture Overview

A well-designed skill follows a **layered architecture**:

```
skill-name/
├── SKILL.md              # Entry point - workflow overview & decision tree
├── LICENSE.txt           # License terms
├── [workflow].md         # Deep-dive docs for complex workflows
├── scripts/              # Executable tools
│   ├── tool1.py
│   ├── tool2.js
│   └── ...
├── templates/            # Optional: starter files, boilerplate
├── reference/            # Optional: reference materials, schemas
└── examples/             # Optional: example inputs/outputs
```

### Key Principles

1. **SKILL.md is the entry point** - Claude reads this first to understand capabilities
2. **One skill = one domain** - Skills should be cohesive (e.g., "PPTX manipulation" not "Office files")
3. **Workflows over tools** - Document *workflows* (sequences of actions), not just individual tools
4. **Scripts are both CLI and importable** - Design scripts to work standalone and as libraries

---

## File Structure Patterns

### Pattern 1: Simple Skill (single workflow)

```
simple-skill/
├── SKILL.md              # Everything in one file
├── LICENSE.txt
└── scripts/
    └── main_tool.py
```

**Use when:** The skill has one clear workflow with 1-3 steps.

### Pattern 2: Multi-Workflow Skill

```
complex-skill/
├── SKILL.md              # Overview + workflow routing
├── workflow-a.md         # Detailed workflow A documentation
├── workflow-b.md         # Detailed workflow B documentation
├── LICENSE.txt
└── scripts/
    ├── workflow_a_tool.py
    ├── workflow_b_tool.py
    └── shared_utils.py
```

**Use when:** The skill has distinct workflows that share a domain but have different tools/steps.

**Example from PPTX skill:**
- `SKILL.md` - Overview and workflow selection
- `html2pptx.md` - Creating new presentations workflow
- `ooxml.md` - Editing existing presentations workflow

### Pattern 3: Skill with Supporting Infrastructure

```
infrastructure-skill/
├── SKILL.md
├── [workflow].md
├── LICENSE.txt
├── scripts/
│   ├── main_tools/
│   └── utilities/
├── schemas/              # Validation schemas
├── templates/            # Starter templates
└── reference/            # Reference documentation
```

**Use when:** The skill needs validation schemas, templates, or extensive reference materials.

---

## Documentation Patterns

### SKILL.md Structure

```markdown
---
name: skill-name
description: "One-line description for skill matching/discovery"
license: Proprietary. LICENSE.txt has complete terms
---

# Skill Title

## Overview
Brief explanation of what this skill enables.

## Reading and Analyzing [Domain]
How to inspect/understand existing files.

## Workflow A: [Action] 
### When to use
### Workflow steps
1. Step with command examples
2. Step with command examples

## Workflow B: [Action]
### When to use  
### Workflow steps

## Dependencies
List of required tools with installation commands.
```

### Key Documentation Principles

1. **Frontmatter is required** - `name`, `description`, `license` fields
2. **Link to detailed docs** - Use `[workflow.md](workflow.md)` for complex workflows
3. **Include command examples** - Show exact commands with realistic parameters
4. **Document decision points** - Help Claude choose the right workflow
5. **Specify file reading requirements** - "Read ENTIRE file" when context matters

**Example from PPTX skill:**

```markdown
### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`html2pptx.md`](html2pptx.md) completely 
   from start to finish. **NEVER set any range limits when reading this file.**
```

### Workflow Documentation Structure

For detailed workflow files (e.g., `html2pptx.md`):

```markdown
# Workflow Title

## Table of Contents
1. [Section 1](#section-1)
2. [Section 2](#section-2)

---

## Section 1: [Concept/Tool]

### Basic Usage
Code example with explanation

### API Reference  
Detailed parameters and return values

### Common Patterns
Reusable patterns and best practices

### Critical Rules
⚠️ Important constraints and gotchas

---

## Section 2: [Concept/Tool]
...
```

---

## Script Design Patterns

### Pattern 1: Dual-Mode Scripts (CLI + Library)

Scripts should work both as command-line tools and importable modules:

```python
#!/usr/bin/env python3
"""
Brief description of what this script does.

Usage:
    python script.py <input> <output> [--options]

Examples:
    python script.py input.pptx output.json
    python script.py input.pptx output.json --issues-only
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Optional

# ============================================================
# Core Functions (importable)
# ============================================================

def main_function(input_path: Path, options: dict = None) -> dict:
    """
    Main functionality - can be imported and called directly.
    
    Args:
        input_path: Path to input file
        options: Optional configuration dict
        
    Returns:
        Processed data as dictionary
    """
    # Implementation
    pass


def helper_function(data: dict) -> dict:
    """Helper that can also be imported."""
    pass


# ============================================================
# CLI Interface
# ============================================================

def main():
    """Command-line entry point."""
    parser = argparse.ArgumentParser(
        description="Script description",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python script.py input.pptx output.json
    Basic usage description
    
  python script.py input.pptx output.json --option
    Usage with option
        """,
    )
    
    parser.add_argument("input", help="Input file path")
    parser.add_argument("output", help="Output file path")
    parser.add_argument("--option", action="store_true", help="Optional flag")
    
    args = parser.parse_args()
    
    # Validate inputs
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
        
    # Call core function
    try:
        result = main_function(input_path, {"option": args.option})
        # Handle output
        print(f"Success: {result}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

**Example from PPTX skill (`inventory.py`):**
- `extract_text_inventory()` - Core function, importable
- `save_inventory()` - Helper function, importable
- `main()` - CLI wrapper with argparse

### Pattern 2: Data Classes for Structured Output

Use dataclasses for complex return types:

```python
from dataclasses import dataclass
from typing import List, Optional, Dict

@dataclass
class ParagraphData:
    """Represents a text paragraph with formatting."""
    text: str
    bullet: bool = False
    level: Optional[int] = None
    alignment: Optional[str] = None
    font_name: Optional[str] = None
    font_size: Optional[float] = None
    bold: Optional[bool] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        result = {"text": self.text}
        if self.bullet:
            result["bullet"] = self.bullet
        if self.level is not None:
            result["level"] = self.level
        # ... only include non-None values
        return result


@dataclass  
class ShapeData:
    """Represents a shape with position and content."""
    left: float
    top: float
    width: float
    height: float
    paragraphs: List[ParagraphData]
    placeholder_type: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "left": self.left,
            "top": self.top,
            "width": self.width,
            "height": self.height,
            "paragraphs": [p.to_dict() for p in self.paragraphs],
        }
```

### Pattern 3: JavaScript Library Module

For Node.js tools, export a function that can be required:

```javascript
/**
 * module-name - Brief description
 * 
 * USAGE:
 *   const moduleName = require('./module-name');
 *   const result = await moduleName(input, options);
 * 
 * FEATURES:
 *   - Feature 1
 *   - Feature 2
 * 
 * RETURNS:
 *   { property1, property2 }
 */

const dependency1 = require('dependency1');
const dependency2 = require('dependency2');

// Constants
const CONSTANT_VALUE = 100;

// Helper functions (not exported)
function helperFunction(data) {
    // ...
}

// Main function (exported)
async function mainFunction(inputFile, options = {}) {
    const {
        optionA = 'default',
        optionB = null
    } = options;
    
    // Validation
    if (!inputFile) {
        throw new Error('inputFile is required');
    }
    
    // Processing
    const result = await processData(inputFile);
    
    return {
        output: result,
        metadata: { /* ... */ }
    };
}

module.exports = mainFunction;
```

---

## Workflow Design Patterns

### Pattern 1: Linear Pipeline

```
Input → Step 1 → Step 2 → Step 3 → Output
```

**Example:** PPTX template workflow
1. Extract text → `markitdown`
2. Create thumbnails → `thumbnail.py`
3. Analyze & plan → manual step
4. Rearrange slides → `rearrange.py`
5. Extract inventory → `inventory.py`
6. Generate replacements → manual step
7. Apply replacements → `replace.py`

### Pattern 2: Branch-and-Merge

```
                    ┌→ Path A → ┐
Input → Decision →  │          │ → Merge → Output
                    └→ Path B → ┘
```

**Example:** PPTX creation
- Decision: Template or from scratch?
- Path A: Template workflow (rearrange + replace)
- Path B: HTML workflow (html2pptx.js)

### Pattern 3: Transform-Validate-Apply

```
Read → Transform → Validate → Apply → Verify
```

**Example:** PPTX OOXML editing
1. Unpack PPTX → XML files
2. Edit XML (transform)
3. Validate XML structure
4. Pack back to PPTX
5. Open in PowerPoint to verify

### Data Flow Between Steps

Use **JSON files** as intermediate data format:

```python
# Step 1: Extract
inventory = extract_text_inventory(input_path)
save_inventory(inventory, "inventory.json")

# Step 2: Transform (can be manual or automated)
# User creates "replacements.json" based on inventory

# Step 3: Apply
apply_replacements(input_path, "replacements.json", output_path)
```

---

## Validation Strategies

### Strategy 1: Schema Validation

Validate XML/JSON against schemas:

```python
def validate_against_xsd(self):
    """Validate XML files against XSD schemas."""
    from lxml import etree
    
    schema = etree.XMLSchema(etree.parse(schema_path))
    for xml_file in self.xml_files:
        doc = etree.parse(str(xml_file))
        if not schema.validate(doc):
            errors.append(f"{xml_file}: {schema.error_log}")
    return len(errors) == 0
```

### Strategy 2: Structural Validation

Check relationships, references, and integrity:

```python
def validate_file_references(self):
    """Validate all file references exist."""
    errors = []
    for rel in relationships:
        target_path = resolve_path(rel.target)
        if not target_path.exists():
            errors.append(f"Missing file: {target_path}")
    return errors
```

### Strategy 3: Overflow/Bounds Checking

Check that content fits within containers:

```python
def validate_text_overflow(self):
    """Check if text overflows shape bounds."""
    for shape in shapes:
        text_height = measure_text_height(shape.text, shape.font)
        if text_height > shape.height:
            overflow = text_height - shape.height
            errors.append(f"{shape.id}: overflow by {overflow}in")
```

### Strategy 4: Visual Verification

Generate visual outputs for human review:

```python
def create_thumbnail_grid(slides, output_path):
    """Create visual grid for human verification."""
    # Convert to images
    # Arrange in grid with labels
    # Save for inspection
```

### Strategy 5: Before/After Comparison

Track changes and detect regressions:

```python
def check_no_regression(original_data, updated_data):
    """Ensure changes didn't make things worse."""
    original_issues = detect_issues(original_data)
    updated_issues = detect_issues(updated_data)
    
    new_issues = updated_issues - original_issues
    if new_issues:
        raise ValidationError(f"New issues introduced: {new_issues}")
```

---

## Example: PPTX Skill Deep Dive

### Architecture

```
skills/pptx/
├── SKILL.md              # 484 lines - Main entry, 3 workflows
├── html2pptx.md          # 625 lines - New presentation workflow  
├── ooxml.md              # 427 lines - Raw XML editing workflow
├── LICENSE.txt
├── scripts/
│   ├── html2pptx.js      # 979 lines - HTML→PPTX conversion
│   ├── inventory.py      # 1021 lines - Text extraction
│   ├── rearrange.py      # 232 lines - Slide manipulation
│   ├── replace.py        # 386 lines - Text replacement
│   └── thumbnail.py      # 451 lines - Visual thumbnails
└── ooxml/
    ├── scripts/
    │   ├── unpack.py     # Extract ZIP to XML
    │   ├── pack.py       # XML back to ZIP
    │   ├── validate.py   # Validation orchestrator
    │   └── validation/
    │       ├── base.py   # Base validator class
    │       ├── pptx.py   # PPTX-specific validation
    │       └── ...
    └── schemas/          # XSD schemas for validation
```

### Three Workflows

| Workflow | When to Use | Key Tools |
|----------|-------------|-----------|
| **HTML → PPTX** | Creating from scratch | `html2pptx.js`, PptxGenJS |
| **Template** | Using branded templates | `thumbnail.py`, `inventory.py`, `rearrange.py`, `replace.py` |
| **OOXML Edit** | Modifying existing files | `unpack.py`, `validate.py`, `pack.py` |

### Key Design Decisions

1. **Separation of concerns:** Each script does ONE thing well
2. **JSON as interchange format:** `inventory.py` outputs JSON, `replace.py` consumes JSON
3. **Validation at boundaries:** Validate after each major transformation
4. **Visual feedback:** `thumbnail.py` provides human-verifiable output
5. **Graceful degradation:** Scripts report errors but don't crash unexpectedly

### Code Patterns Worth Copying

**Dataclass with to_dict() method:**
```python
@dataclass
class ShapeData:
    left: float
    top: float
    # ... fields
    
    def to_dict(self) -> dict:
        """Convert to JSON-serializable dict, excluding None values."""
        result = {"left": self.left, "top": self.top}
        if self.optional_field is not None:
            result["optional_field"] = self.optional_field
        return result
```

**CLI with comprehensive help:**
```python
parser = argparse.ArgumentParser(
    description="Brief description",
    formatter_class=argparse.RawDescriptionHelpFormatter,
    epilog="""
Examples:
  python script.py input.pptx output.json
    Description of basic usage
    
  python script.py input.pptx output.json --flag
    Description of flag usage
    """,
)
```

**Validation that collects all errors:**
```python
def validate(self):
    all_valid = True
    if not self.check_a():
        all_valid = False
    if not self.check_b():
        all_valid = False
    if not self.check_c():
        all_valid = False
    return all_valid
```

---

## Checklist for Creating New Skills

### Planning Phase

- [ ] **Define the domain:** What file types/systems does this skill work with?
- [ ] **Identify workflows:** What are the distinct use cases? (Usually 2-4)
- [ ] **Map dependencies:** What tools/libraries are required?
- [ ] **Design data flow:** What's the input/output of each step?

### Documentation Phase

- [ ] **Create SKILL.md** with:
  - [ ] Frontmatter (name, description, license)
  - [ ] Overview section
  - [ ] Workflow sections with steps
  - [ ] Dependencies section
- [ ] **Create workflow docs** for complex workflows (>5 steps)
- [ ] **Include command examples** with realistic parameters
- [ ] **Document decision points** (when to use which workflow)

### Implementation Phase

- [ ] **Create scripts** that are:
  - [ ] Both CLI and importable
  - [ ] Self-documenting (docstrings, --help)
  - [ ] Error-handling (graceful failures)
- [ ] **Use data classes** for structured data
- [ ] **Use JSON** for intermediate data
- [ ] **Add validation** at workflow boundaries

### Quality Phase

- [ ] **Test each script** standalone
- [ ] **Test the full workflow** end-to-end
- [ ] **Document edge cases** and limitations
- [ ] **Add visual verification** where applicable

### Final Checks

- [ ] Can Claude understand when to use this skill? (clear description)
- [ ] Can Claude follow the workflows? (clear steps with commands)
- [ ] Are all required files referenced? (no broken links)
- [ ] Are dependencies documented? (installation commands)

---

## Quick Reference: File Templates

### SKILL.md Template

```markdown
---
name: skill-name
description: "Brief description for skill discovery"
license: Proprietary. LICENSE.txt has complete terms
---

# Skill Title

## Overview

Brief explanation of what this skill enables and when to use it.

## Reading and Analyzing [Domain]

How to inspect existing files:

\`\`\`bash
# Command to read/analyze
tool-name input-file
\`\`\`

## Creating [Output Type]

### Workflow

1. **Step 1**: Description
   \`\`\`bash
   command example
   \`\`\`

2. **Step 2**: Description
   \`\`\`bash
   command example
   \`\`\`

## Editing Existing [Files]

### Workflow

1. **Step 1**: Description
2. **Step 2**: Description

## Dependencies

- **tool-name**: \`pip install tool-name\` (purpose)
- **other-tool**: \`npm install -g other-tool\` (purpose)
```

### Script Template (Python)

```python
#!/usr/bin/env python3
"""
Brief description.

Usage:
    python script.py <input> <output>
"""

import argparse
import sys
from pathlib import Path


def core_function(input_path: Path) -> dict:
    """Main functionality - importable."""
    pass


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Description")
    parser.add_argument("input", help="Input file")
    parser.add_argument("output", help="Output file")
    args = parser.parse_args()
    
    try:
        result = core_function(Path(args.input))
        # Handle output
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

---

## Related Documents

- [Agent Skills Spec](../spec/agent-skills-spec.md) - Formal specification
- [Skill Template](../template/SKILL.md) - Starter template
- [PPTX Skill](../skills/pptx/SKILL.md) - Complex skill example

