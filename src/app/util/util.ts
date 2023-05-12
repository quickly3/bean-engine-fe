export function CopyToClipboard(id: any) {
  var r = document.createRange();

  const _node = document.getElementById(id);

  if (_node) {
    r.selectNode(_node);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(r);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();
  }
}
