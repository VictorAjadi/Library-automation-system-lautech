import toast from "react-hot-toast";
export const copyToClipBoard = (url = window.location.href, msg) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url.toString()).then(() => {
            toast.success(msg);
        }).catch((err) => {
            toast.error('Failed to copy link');
        });
    } else {
        toast.error('Clipboard API not supported');
    }
};


