// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_SETTINGS, QuerySettings } from 'setting';
import { LarkClient } from 'src';


class UploadModal extends Modal {
	client: LarkClient;
	result: string;
	setting: QuerySettings;
	onSubmit: (result: string) => void;

	constructor(app: App, setting: QuerySettings, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.setting = setting;
		this.client = new LarkClient(setting.token, setting.user);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Upload Config" });

		new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					this.result = value
				}));

		new Setting(contentEl)
			.setName("Current List")
			.addToggle((toggle) =>
				toggle.onChange((value) => {
					// this.result = value
				}
				));

		new Setting(contentEl)
			.setName("New List")
			.setClass('obsidian-lark-upload-list')
			.addDropdown(async (dropdown) => {
				try {
					const res = await this.client.getRepos()
					if(res.status === 200) {
						dropdown
							.addOptions(res.data.data.map((item: any) => {
								return item.name
							})
							)
					} else {
						new Notice('!Error' + res.data);
					}
				} catch(error) {
					console.log(error)
				}
			})

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.result);
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class GeneralSettingsTab extends PluginSettingTab {
	client: LarkClient;

	constructor(app: App, private plugin: SyncLarkPlugin) {
		super(app, plugin);
	}

	public display(): void {
		this.containerEl.empty();
		this.containerEl.createEl("h2", { text: "General Settings" });

		new Setting(this.containerEl)
			.setName("Token")
			.setDesc("Token From Lark")
			.addText((text) =>
				text
					.setPlaceholder("xxxx")
					.setValue(this.plugin.settings.token)
					.onChange(async (value) => {
						this.plugin.settings.token = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(this.containerEl)
			.setName("Login")
			.setDesc("Login To Lark")
			.addButton((button) =>
				button
					.setDisabled(this.plugin.settings.token === '')
					.setButtonText("Query Login Data")
					.onClick(async () => {
						this.client = new LarkClient(this.plugin.settings.token);
						this.client.getUser().then(async(res) => {
							if(res.status === 200) {
								this.plugin.settings.user = res.data.data;
								await this.plugin.saveSettings();
								new Notice('Login Success');	
							} else {
								new Notice('!Error' + res.data);
							}
						});
						
					})
			);
	}
}

export default class SyncLarkPlugin extends Plugin {
	public settings: QuerySettings;

	async onload() {
		this.settings = Object.assign(DEFAULT_SETTINGS, (await this.loadData()) ?? {});
		this.addSettingTab(new GeneralSettingsTab(this.app, this));

		const ribbonIconEl = this.addRibbonIcon('dice', 'Sync Yuque', (evt: MouseEvent) => {
			new Notice('This is a notice!');

		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'sync-to-lark',
			name: 'Sync to Your Lark',
			callback: () => {
				new UploadModal(this.app, this.settings, (result) => {
					new Notice(`Hello, ${result}!`);
				}).open();
			}
		});

	}

	onunload() {

	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}