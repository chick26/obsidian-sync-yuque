// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_SETTINGS, QuerySettings, UploadSettings } from 'setting';
import { LarkClient, Document, DocumentConfig } from 'src';

class UploadModal extends Modal {
	client: LarkClient;
	fileName: string;
	setting: QuerySettings;
	uploadingSettings: UploadSettings = {
		slug: '',
		title: '',
		namespace: '',
		token: '',
		user: {},
	};
	onSubmit(text: string) {
		console.log('result', text);
	}

	constructor(app: App, setting: QuerySettings, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.setting = setting;
		this.uploadingSettings.namespace = setting.user.login;
		this.client = new LarkClient(setting.token, setting.user);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Upload Config" });

		new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					this.fileName = value
					this.uploadingSettings.title = value;
				}));

		new Setting(contentEl)
			.setName("New List")
			.setClass('obsidian-lark-upload-list')
			.addDropdown(async (dropdown) => {
				try {
					const res = await this.client.getRepos()
					if(res.status === 200) {
						const options:Record<string, string> = {}						
						res.data.data.map((item: any, index: number) => {
							options[item.slug] = item.name;
							if(index == 0) this.uploadingSettings.slug = item.slug;
						})
						dropdown
							.addOptions(options)
							.onChange(async (value) =>	{
								this.uploadingSettings.slug = value;
							});
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
					.onClick( async () => {
						const noteFile = this.app.workspace.getActiveFile();
						if(!noteFile){
							new Notice('No active file')
							return
						}
						const text = await this.app.vault.read(noteFile);
						const doc = new Document(this.client, text, this.fileName);
						this.onUploadFile(doc.dump());
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async onUploadFile(file: DocumentConfig) {
		const namespace = this.uploadingSettings.namespace + '/' + this.uploadingSettings.slug;
		const uploadParams = {
			title: this.uploadingSettings.title || file.title,
			slug: file.slug,
			format: 'markdown',
			file: file.originFile,
		}
		try {
			const res = await this.client.uploadFile(namespace, uploadParams)

			if(res.status === 200) {
				this.close();
				new Notice('Upload Success');
			} else {
				new Error('Upload Error' + res)
			}
		} catch (e) {
			console.log('upload error', e);
		}

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
								new Notice('Login Success My dear ' + res.data.data?.name);	
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