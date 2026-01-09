interface FileBrowserProps {
	selectedFile: string;
	onChange: (v: string, type: string, directory: boolean) => void;
	resourceType?: string;
	restrictNavigationToTopLevel?: boolean;
	startLocation?: string;
	fileUploadSizeLimit?: number;
	restrictUploadType?: string[];
	restrictSelectionType?: string[];
	selectionType?: string;
	hideUploadFile?: boolean;
	hideCreateFolder?: boolean;
	hideDelete?: boolean;
	hideEdit?: boolean;
	fileCategory?: string[];
	cropToWidth?: number;
	cropToHeight?: number;
	cropToCircle?: boolean;
	cropToMaxWidth?: number;
	cropToMaxHeight?: number;
	cropToMinWidth?: number;
	cropToMinHeight?: number;
	editOnUpload: boolean;
	cropToAspectRatio?: string;
	clientCode?: string;
	allowMultipleSelection?: boolean;
}
