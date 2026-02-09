/**
 * Modal and Form UI Logic
 */

export const ModalUI = {
    container: document.getElementById('modal-container'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    closeBtn: document.getElementById('modal-close'),

    init(onSave) {
        this.closeBtn.onclick = () => this.hide();
        this.container.onclick = (e) => {
            if (e.target === this.container) this.hide();
        };
        this.onSave = onSave;
    },

    show(type, data = null) {
        this.container.classList.remove('hidden');
        this.title.textContent = data ? `Edit ${type}` : `Add ${type}`;
        this.renderForm(type, data);
    },

    hide() {
        this.container.classList.add('hidden');
    },

    renderForm(type, data) {
        if (type === 'Subject') {
            this.body.innerHTML = `
                <form id="data-form" class="form-grid">
                    <div class="form-group">
                        <label>Subject Name</label>
                        <input type="text" id="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Attended</label>
                            <input type="number" id="attended" required min="0" value="${data?.attended || 0}">
                        </div>
                        <div class="form-group">
                            <label>Total Classes</label>
                            <input type="number" id="total" required min="1" value="${data?.total || 1}">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">Save Subject</button>
                </form>
            `;
        } else {
            this.body.innerHTML = `
                <form id="data-form" class="form-grid">
                    <div class="form-group">
                        <label>Assignment Title</label>
                        <input type="text" id="title" required value="${data?.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Subject Label</label>
                        <input type="text" id="subject" required value="${data?.subject || ''}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Due Date</label>
                            <input type="date" id="dueDate" required value="${data?.dueDate ? data.dueDate.split('T')[0] : ''}">
                        </div>
                        <div class="form-group">
                            <label>Workload (1-5)</label>
                            <input type="number" id="workload" required min="1" max="5" value="${data?.workload || 3}">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">Save Assignment</button>
                </form>
            `;
        }

        document.getElementById('data-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = {};
            const inputs = e.target.querySelectorAll('input');
            inputs.forEach(input => {
                formData[input.id] = input.type === 'number' ? parseInt(input.value) : input.value;
            });
            this.onSave(type, formData, data?.id);
            this.hide();
        };
    }
};
