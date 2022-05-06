export class Book {
  bookName = '';
  ISBN13 = '';
  condition = '';
  purchasePrice = '';
  currency = 'KRW';
  purchasePriceSec = '';
  currencySec = '';
  purchaseDate = '';
  purchasePlace = '';
  publicationDate = '';
  author = '';
  topic = '';
  publisher = '';
  imageUrl = '';
  duplicated = '';
  comment = '';

  constructor(item) {
    if (!item) return;
    this.bookName = item.bookName || '';
    this.ISBN13 = item.ISBN13 || '';
    this.condition = item.condition || '';
    this.purchasePrice = item.purchasePrice || '';
    this.currency = item.currency || 'KRW';
    this.purchasePriceSec = item.purchasePriceSec || '';
    this.currencySec = item.currencySec || '';
    this.purchaseDate = item.purchaseDate || '';
    this.purchasePlace = item.purchasePlace || '';
    this.publicationDate = item.publicationDate || '';
    this.author = item.author || '';
    this.topic = item.topic || '';
    this.publisher = item.publisher || '';
    this.imageUrl = item.imageUrl || '';
    this.duplicated = item.duplicated || '';
    this.comment = item.comment || '';
  }
}
