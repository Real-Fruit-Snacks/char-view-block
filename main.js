const { Plugin, PluginSettingTab, Setting } = require('obsidian');

const COLOR_PRESETS = {
  default: {
    name: 'Default',
    numberColor: '#2ecc71',
    upperColor: '#e74c3c',
    lowerColor: '#3498db',
    symbolColor: '#9b59b6',
    spaceColor: '#7f8c8d'
  },
  pastel: {
    name: 'Pastel',
    numberColor: '#a8e6cf',
    upperColor: '#ffd3b6',
    lowerColor: '#ffaaa5',
    symbolColor: '#dda0dd',
    spaceColor: '#d3d3d3'
  },
  dark: {
    name: 'Dark',
    numberColor: '#1e8449',
    upperColor: '#922b21',
    lowerColor: '#1f618d',
    symbolColor: '#6c3483',
    spaceColor: '#566573'
  },
  colorblind: {
    name: 'Colorblind Friendly',
    numberColor: '#0173b2',
    upperColor: '#de8f05',
    lowerColor: '#029e73',
    symbolColor: '#cc78bc',
    spaceColor: '#949494'
  },
  monochrome: {
    name: 'Monochrome',
    numberColor: '#2c3e50',
    upperColor: '#34495e',
    lowerColor: '#7f8c8d',
    symbolColor: '#95a5a6',
    spaceColor: '#bdc3c7'
  },
  ocean: {
    name: 'Ocean',
    numberColor: '#16a085',
    upperColor: '#2980b9',
    lowerColor: '#3498db',
    symbolColor: '#8e44ad',
    spaceColor: '#7f8c8d'
  },
  sunset: {
    name: 'Sunset',
    numberColor: '#e67e22',
    upperColor: '#e74c3c',
    lowerColor: '#f39c12',
    symbolColor: '#d35400',
    spaceColor: '#95a5a6'
  },
  forest: {
    name: 'Forest',
    numberColor: '#27ae60',
    upperColor: '#229954',
    lowerColor: '#28b463',
    symbolColor: '#1e8449',
    spaceColor: '#7f8c8d'
  }
};

const DEFAULT_SETTINGS = {
  numberColor: '#2ecc71',
  upperColor: '#e74c3c',
  lowerColor: '#3498db',
  symbolColor: '#9b59b6',
  spaceColor: '#7f8c8d',
  titleUppercase: true,
  showSpaceSymbol: true,
  spaceSymbol: '␣',
  titleFontSize: '0.8rem',
  showStatistics: false,
  showColorKey: false,
  currentPreset: 'default'
};

class CharViewPlugin extends Plugin {
  async onload() {
    console.log('Loading Character View Block plugin');

    // Load settings
    await this.loadSettings();

    // Register the code block processor
    this.registerMarkdownCodeBlockProcessor('charview', (source, el, ctx) => {
      this.renderCharView(source, el);
    });

    // Add settings tab
    this.addSettingTab(new CharViewSettingTab(this.app, this));
  }

  onunload() {
    console.log('Unloading Character View Block plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // After saving, apply changes to already-rendered blocks
    this.applySettingsToExistingBlocks();
  }

  applyColorPreset(presetKey) {
    const preset = COLOR_PRESETS[presetKey];
    if (preset) {
      this.settings.numberColor = preset.numberColor;
      this.settings.upperColor = preset.upperColor;
      this.settings.lowerColor = preset.lowerColor;
      this.settings.symbolColor = preset.symbolColor;
      this.settings.spaceColor = preset.spaceColor;
      this.settings.currentPreset = presetKey;
    }
  }

  applySettingsToExistingBlocks() {
    const blocks = document.querySelectorAll('.charview-block');
    blocks.forEach((block) => {
      // Set CSS variables used by the stylesheet
      block.style.setProperty('--char-num-color', this.settings.numberColor);
      block.style.setProperty('--char-upper-color', this.settings.upperColor);
      block.style.setProperty('--char-lower-color', this.settings.lowerColor);
      block.style.setProperty('--char-symbol-color', this.settings.symbolColor);
      block.style.setProperty('--char-space-color', this.settings.spaceColor);
      block.style.setProperty('--char-title-font-size', this.settings.titleFontSize);

      // Title uppercase toggle
      const titleEl = block.querySelector('.charview-title');
      if (titleEl) {
        titleEl.style.textTransform = this.settings.titleUppercase ? 'uppercase' : 'none';
      }

      // Update displayed space characters if present
      const spaceEls = block.querySelectorAll('.charview-char.char-space');
      spaceEls.forEach((el) => {
        if (this.settings.showSpaceSymbol) {
          el.textContent = this.settings.spaceSymbol;
        } else {
          el.textContent = '\u00A0';
        }
      });

      // Update statistics visibility
      const statsEl = block.querySelector('.charview-stats');
      if (statsEl) {
        statsEl.style.display = this.settings.showStatistics ? 'flex' : 'none';
      }

      // Update color key visibility
      const keyEl = block.querySelector('.charview-color-key');
      if (keyEl) {
        keyEl.style.display = this.settings.showColorKey ? 'flex' : 'none';
      }
    });
  }

  getCharacterStats(text) {
    const stats = {
      numbers: 0,
      uppercase: 0,
      lowercase: 0,
      symbols: 0,
      spaces: 0,
      total: 0
    };

    for (const ch of text) {
      stats.total++;
      if (/[0-9]/.test(ch)) stats.numbers++;
      else if (/[A-Z]/.test(ch)) stats.uppercase++;
      else if (/[a-z]/.test(ch)) stats.lowercase++;
      else if (/\s/.test(ch)) stats.spaces++;
      else stats.symbols++;
    }

    return stats;
  }

  getCharacterName(ch) {
    const code = ch.charCodeAt(0);
    
    // Common character names
    const specialNames = {
      32: 'Space',
      33: 'Exclamation Mark',
      34: 'Quotation Mark',
      35: 'Number Sign',
      36: 'Dollar Sign',
      37: 'Percent Sign',
      38: 'Ampersand',
      39: 'Apostrophe',
      40: 'Left Parenthesis',
      41: 'Right Parenthesis',
      42: 'Asterisk',
      43: 'Plus Sign',
      44: 'Comma',
      45: 'Hyphen-Minus',
      46: 'Period',
      47: 'Slash',
      58: 'Colon',
      59: 'Semicolon',
      60: 'Less-Than Sign',
      61: 'Equals Sign',
      62: 'Greater-Than Sign',
      63: 'Question Mark',
      64: 'At Sign',
      91: 'Left Square Bracket',
      92: 'Backslash',
      93: 'Right Square Bracket',
      94: 'Caret',
      95: 'Underscore',
      96: 'Grave Accent',
      123: 'Left Curly Bracket',
      124: 'Vertical Bar',
      125: 'Right Curly Bracket',
      126: 'Tilde',
      10: 'Line Feed',
      13: 'Carriage Return',
      9: 'Tab'
    };

    if (specialNames[code]) {
      return specialNames[code];
    } else if (code >= 65 && code <= 90) {
      return `Uppercase ${ch}`;
    } else if (code >= 97 && code <= 122) {
      return `Lowercase ${ch}`;
    } else if (code >= 48 && code <= 57) {
      return `Digit ${ch}`;
    } else {
      return 'Character';
    }
  }

  renderCharView(source, container) {
    // Clear any existing content
    container.empty();

    // Normalize line endings and split into lines
    let lines = source.replace(/\r\n/g, '\n').split('\n');

    // ---------- Parse optional title from first NON-EMPTY line ----------
    // Accepted formats (case-insensitive "title"):
    //   title:"My title here"
    //   title: My title here
    let title = null;

    let firstNonEmptyIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() !== "") {
        firstNonEmptyIndex = i;
        break;
      }
    }

    if (firstNonEmptyIndex !== -1) {
      const first = lines[firstNonEmptyIndex].trim();

      const titleMatchQuoted = first.match(/^title\s*:\s*"([^"]+)"\s*$/i);
      const titleMatchPlain = first.match(/^title\s*:\s*(.+)$/i);

      if (titleMatchQuoted) {
        title = titleMatchQuoted[1].trim();
        lines.splice(firstNonEmptyIndex, 1);
      } else if (titleMatchPlain) {
        title = titleMatchPlain[1].trim();
        lines.splice(firstNonEmptyIndex, 1);
      }
    }

    // ---------- Build outer block container ----------
    const block = container.createDiv({ cls: 'charview-block' });

    // Apply settings as CSS variables on the block element so CSS can use them
    block.style.setProperty('--char-num-color', this.settings.numberColor);
    block.style.setProperty('--char-upper-color', this.settings.upperColor);
    block.style.setProperty('--char-lower-color', this.settings.lowerColor);
    block.style.setProperty('--char-symbol-color', this.settings.symbolColor);
    block.style.setProperty('--char-space-color', this.settings.spaceColor);
    block.style.setProperty('--char-title-font-size', this.settings.titleFontSize);

    // Optional title row
    if (title) {
      const titleDiv = block.createDiv({ cls: 'charview-title' });
      titleDiv.setText(title);
      titleDiv.style.textTransform = this.settings.titleUppercase ? 'uppercase' : 'none';
    }

    // Color Key
    if (this.settings.showColorKey) {
      const keyDiv = block.createDiv({ cls: 'charview-color-key' });

      const keyItems = [
        { label: 'Numbers (0-9)', color: this.settings.numberColor },
        { label: 'Uppercase (A-Z)', color: this.settings.upperColor },
        { label: 'Lowercase (a-z)', color: this.settings.lowerColor },
        { label: 'Symbols', color: this.settings.symbolColor },
        { label: 'Spaces', color: this.settings.spaceColor }
      ];

      keyItems.forEach(item => {
        const keyItem = keyDiv.createDiv({ cls: 'charview-key-item' });

        const colorBox = keyItem.createDiv({ cls: 'charview-key-color' });
        colorBox.style.backgroundColor = item.color;

        const label = keyItem.createSpan({ cls: 'charview-key-label' });
        label.setText(item.label);
      });
    }

    // Wrapper for all character lines
    const wrapper = block.createDiv({ cls: 'charview-wrapper' });

    // ---------- Render each line & character ----------
    for (const line of lines) {
      const lineDiv = wrapper.createDiv({ cls: 'charview-line' });

      // Show ␤ for empty lines so they remain visible
      if (line.length === 0) {
        const emptyChar = lineDiv.createDiv({
          cls: 'charview-char char-empty',
        });
        emptyChar.setText('␤');
        
        // Add tooltip for empty line
        emptyChar.setAttribute('title', 'Empty Line');
        
        continue;
      }

      for (const ch of line) {
        const charType = this.getCharType(ch);

        const charDiv = lineDiv.createDiv({
          cls: `charview-char ${charType}`,
        });

        // Decide what to display for spaces (visible symbol or non-breaking space)
        let display = ch;
        if (ch === ' ') {
          display = this.settings.showSpaceSymbol ? this.settings.spaceSymbol : '\u00A0';
        }

        charDiv.setText(display);

        // Add tooltip with character information
        const charCode = ch.charCodeAt(0);
        const charName = this.getCharacterName(ch);
        const tooltipText = `${charName}\nUnicode: U+${charCode.toString(16).toUpperCase().padStart(4, '0')}\nDecimal: ${charCode}`;
        charDiv.setAttribute('title', tooltipText);
      }
    }

    // Character Statistics
    if (this.settings.showStatistics) {
      const allText = lines.join('');
      const stats = this.getCharacterStats(allText);

      const statsDiv = block.createDiv({ cls: 'charview-stats' });

      const statItems = [
        { label: 'Numbers', value: stats.numbers, color: this.settings.numberColor },
        { label: 'Uppercase', value: stats.uppercase, color: this.settings.upperColor },
        { label: 'Lowercase', value: stats.lowercase, color: this.settings.lowerColor },
        { label: 'Symbols', value: stats.symbols, color: this.settings.symbolColor },
        { label: 'Spaces', value: stats.spaces, color: this.settings.spaceColor },
        { label: 'Total', value: stats.total, color: 'var(--text-normal)' }
      ];

      statItems.forEach(item => {
        const statItem = statsDiv.createSpan({ cls: 'charview-stat-item' });

        const labelSpan = statItem.createSpan();
        labelSpan.setText(`${item.label}: `);

        const valueSpan = statItem.createSpan();
        valueSpan.setText(item.value.toString());
        valueSpan.style.color = item.color;
      });
    }
  }

  // Decide what kind of character this is for styling
  getCharType(ch) {
    if (/[0-9]/.test(ch)) return 'char-num';
    if (/[A-Z]/.test(ch)) return 'char-upper';
    if (/[a-z]/.test(ch)) return 'char-lower';
    if (/\s/.test(ch)) return 'char-space';
    return 'char-symbol'; // punctuation and other symbols
  }
}

/* Settings tab implementation */
class CharViewSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Char View Block — Settings' });

    // === DISPLAY OPTIONS ===
    containerEl.createEl('h3', { text: 'Display Options' });

    new Setting(containerEl)
      .setName('Show statistics')
      .setDesc('Display character count statistics below each char view block.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showStatistics)
        .onChange(async (value) => {
          this.plugin.settings.showStatistics = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show color key')
      .setDesc('Display a color legend showing what each color represents.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showColorKey)
        .onChange(async (value) => {
          this.plugin.settings.showColorKey = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Title uppercase')
      .setDesc('Show titles in uppercase. Toggle off to preserve original casing.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.titleUppercase)
        .onChange(async (value) => {
          this.plugin.settings.titleUppercase = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Title font size')
      .setDesc('Font size for the title (e.g. 0.8rem, 14px).')
      .addText(text => text
        .setPlaceholder('0.8rem')
        .setValue(this.plugin.settings.titleFontSize)
        .onChange(async (value) => {
          this.plugin.settings.titleFontSize = value || DEFAULT_SETTINGS.titleFontSize;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show visible space symbol')
      .setDesc('If on, spaces show as the configured symbol (default: ␣). If off, boxes show an invisible non-breaking space so layout stays the same.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showSpaceSymbol)
        .onChange(async (value) => {
          this.plugin.settings.showSpaceSymbol = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Space symbol')
      .setDesc('Character used to represent spaces (only used when "Show visible space symbol" is enabled).')
      .addText(text => text
        .setPlaceholder('␣')
        .setValue(this.plugin.settings.spaceSymbol)
        .onChange(async (value) => {
          this.plugin.settings.spaceSymbol = value || DEFAULT_SETTINGS.spaceSymbol;
          await this.plugin.saveSettings();
        }));

    // === COLOR PRESETS ===
    containerEl.createEl('h3', { text: 'Color Presets' });

    new Setting(containerEl)
      .setName('Color preset')
      .setDesc('Choose a preset color scheme. Selecting a preset will update all color settings below.')
      .addDropdown(dropdown => {
        Object.keys(COLOR_PRESETS).forEach(key => {
          dropdown.addOption(key, COLOR_PRESETS[key].name);
        });
        dropdown
          .setValue(this.plugin.settings.currentPreset)
          .onChange(async (value) => {
            this.plugin.applyColorPreset(value);
            await this.plugin.saveSettings();
            // Refresh the settings display to show new colors
            this.display();
          });
      });

    // === CUSTOM COLORS ===
    containerEl.createEl('h3', { text: 'Custom Colors' });
    
    const customColorDesc = containerEl.createDiv({ cls: 'setting-item-description' });
    customColorDesc.setText('Customize individual colors. Note: Changing these will set the preset to "Custom".');
    customColorDesc.style.marginBottom = '10px';
    customColorDesc.style.fontSize = '0.9em';
    customColorDesc.style.opacity = '0.8';

    new Setting(containerEl)
      .setName('Numbers color')
      .setDesc('Color used for digits (0-9).')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.numberColor)
        .onChange(async (value) => {
          this.plugin.settings.numberColor = value;
          this.plugin.settings.currentPreset = 'custom';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Uppercase color')
      .setDesc('Color used for uppercase letters.')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.upperColor)
        .onChange(async (value) => {
          this.plugin.settings.upperColor = value;
          this.plugin.settings.currentPreset = 'custom';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Lowercase color')
      .setDesc('Color used for lowercase letters.')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.lowerColor)
        .onChange(async (value) => {
          this.plugin.settings.lowerColor = value;
          this.plugin.settings.currentPreset = 'custom';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Symbol color')
      .setDesc('Color used for punctuation and symbols.')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.symbolColor)
        .onChange(async (value) => {
          this.plugin.settings.symbolColor = value;
          this.plugin.settings.currentPreset = 'custom';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Space color')
      .setDesc('Color used to style space boxes (if you want them tinted). Mostly used if you use a visible space symbol.')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.spaceColor)
        .onChange(async (value) => {
          this.plugin.settings.spaceColor = value;
          this.plugin.settings.currentPreset = 'custom';
          await this.plugin.saveSettings();
        }));

    // Apply settings to existing blocks when the settings panel is shown (ensures UI reflects current)
    this.plugin.applySettingsToExistingBlocks();
  }
}

module.exports = CharViewPlugin;