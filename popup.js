document.addEventListener('DOMContentLoaded', function() {
    const downloadList = document.getElementById('downloadList');
    const status = document.getElementById('status');

    function setStatus(message, isError = false) {
        status.textContent = message;
        status.style.color = isError ? '#ff4444' : 'var(--status-color)';
        status.style.opacity = '1';
        setTimeout(() => {
            status.style.opacity = '0';
        }, 3000);
    }

    function truncateFileName(fileName, maxLength = 30) {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const nameWithoutExtension = fileName.slice(0, fileName.length - extension.length - 1);
        const truncated = nameWithoutExtension.slice(0, maxLength - 3 - extension.length) + '...';
        return truncated + '.' + extension;
    }

    chrome.downloads.search({}, function(downloads) {
        if (downloads.length === 0) {
            setStatus('No downloads found.');
            return;
        }

        downloads.forEach(function(download, index) {
            if (download.filename && download.url) {
                const downloadItem = document.createElement('div');
                downloadItem.className = 'download-item';
                downloadItem.style.opacity = '0';
                downloadItem.style.transform = 'translateY(20px)';

                const fileName = document.createElement('span');
                fileName.className = 'file-name';
                const fullFileName = download.filename.split('\\').pop().split('/').pop();
                fileName.textContent = truncateFileName(fullFileName);
                fileName.title = fullFileName; // 添加完整文件名作为悬停提示
                downloadItem.appendChild(fileName);

                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy Link';
                copyButton.className = 'copy-button';
                copyButton.addEventListener('click', function() {
                    navigator.clipboard.writeText(download.url).then(function() {
                        copyButton.textContent = 'Copied!';
                        setStatus('Link copied to clipboard!');
                        setTimeout(function() {
                            copyButton.textContent = 'Copy Link';
                        }, 2000);
                    }).catch(function(err) {
                        console.error('Failed to copy: ', err);
                        setStatus('Failed to copy link. Please try again.', true);
                    });
                });
                downloadItem.appendChild(copyButton);

                downloadList.appendChild(downloadItem);

                setTimeout(() => {
                    downloadItem.style.opacity = '1';
                    downloadItem.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });

        if (downloadList.children.length === 0) {
            setStatus('No valid downloads found.');
        }
    });
});