import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Tooltip } from '@mui/material';
import electron from 'electron';
import styles from './WindowFrame.module.scss';

function WindowFrame() {
	return (
		<div className={`${styles.drag} w-full h-full bg-[#252628] flex justify-between items-center`}>
			<div className="flex justify-start items-center pl-1">
				<a
					className={`${styles['no-drag']} hover:opacity-50`}
					onClick={() => {
						window.close();
					}}
				>
					<Tooltip title="Close" arrow>
						<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<XMarkIcon className="text-white" />
						</svg>
					</Tooltip>
				</a>
				<a
					className={`${styles['no-drag']} hover:opacity-50`}
					onClick={() => {
						electron.ipcRenderer.send('minimize-window');
					}}
				>
					<Tooltip title="Minimize" arrow>
						<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<ChevronDownIcon className="text-white" />
						</svg>
					</Tooltip>
				</a>
			</div>
		</div>
	);
}

export default WindowFrame;
