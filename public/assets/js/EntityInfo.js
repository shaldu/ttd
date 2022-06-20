export class EntityInfo {

    constructor(entity) {
        this.entity = entity
    }

    showTileInfoField() {
        let baseElm = document.querySelector('.selectStatusWindow');
        let titleElm = baseElm.querySelector('.tile-name');
        let titleDescription = baseElm.querySelector('.tile-description');
        let statusElm = baseElm.querySelector('.status-value');

        baseElm.classList.add('show');

        titleElm.innerHTML = this.entity.name;
        titleDescription.innerHTML = this.entity.description;
        if (this.entity.isBurning) {
            statusElm.innerHTML = "burning";
        } else {
            statusElm.innerHTML = "";
        }

        this.showHealthValue();
    }

    showHealthValue() {
        let healthValue = document.querySelector('.health-value');
        healthValue.innerHTML =  this.entity.health + " / " + this.entity.maxHealth;
    }

}