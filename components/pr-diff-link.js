(function () {
  const GITHUB_REPO = "i-dot-ai/ai-gov-uk-cms-content";
  const DEFAULT_BRANCH = "main";

  const backend = CMS.getBackend();
  const user = backend.currentUser();
  console.log('user', user);

  function getWorkflowBranchFromHash() {
    const hash = window.location.hash.slice(1);
    const match = hash.match(/\/collections\/([^/]+)\/entries\/([^/]+)/);
    if (!match) return null;
    const [, collection, slug] = match;
    return "cms/" + collection + "/" + slug;
  }

  function getCompareUrl() {
    const branch = getWorkflowBranchFromHash();
    if (!branch) return null;
    return "https://github.com/" + GITHUB_REPO + "/compare/" + DEFAULT_BRANCH + "..." + encodeURIComponent(branch);
  }

  const PrDiffLinkControl = window.createClass({
    componentDidMount: function () {
      this._onHashChange = () => this.forceUpdate();
      window.addEventListener("hashchange", this._onHashChange);
    },
    componentWillUnmount: function () {
      window.removeEventListener("hashchange", this._onHashChange);
    },
    render: function () {
      const href = getCompareUrl();
      const classNameWrapper = this.props.classNameWrapper;
      if (!href) {
        return window.h("p", { className: classNameWrapper }, "View PR diff on GitHub (available when editing an entry in the workflow).");
      }
      return window.h("div", { className: classNameWrapper },
        window.h("a", {
          href: href,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { color: "#2563eb", textDecoration: "underline" }
        }, "View PR diff on GitHub")
      );
    }
  });

  const PrDiffLinkPreview = window.createClass({
    render: function () {
      return null;
    }
  });

  window.CMS.registerWidget("prDiffLink", PrDiffLinkControl, PrDiffLinkPreview);
})();
