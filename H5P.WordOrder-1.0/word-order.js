(function ($) {
    H5P.WordOrder = (function ($) {
        function WordOrder(params, id) {
            this.params = params;
            this.id = id;
            this.words = params.words || [];
            this.instructions = params.instructions || 'Drag and drop the words to form a correct sentence.';
            this.feedback = params.feedback || {
                correct: 'Correct! The sentence is in the right order.',
                incorrect: 'Not quite right. Try again!'
            };
        }

        WordOrder.prototype.attach = function ($container) {
            var self = this;
            $container = H5P.jQuery($container);
            
            // Create main container
            $container.addClass('h5p-word-order');
            
            // Add instructions
            H5P.jQuery('<div>')
                .addClass('h5p-word-order-instructions')
                .text(this.instructions)
                .appendTo($container);
            
            // Create sortable words container
            var $wordsContainer = H5P.jQuery('<div>')
                .addClass('h5p-word-order-words-container sortable')
                .appendTo($container);
            
            // Shuffle words
            var shuffledWords = [].concat(this.words).sort(function() { return Math.random() - 0.5; });
            
            // Create word elements
            shuffledWords.forEach(function(word, index) {
                H5P.jQuery('<div>')
                    .addClass('h5p-word-order-word')
                    .attr('data-index', index)
                    .text(word.word || word)
                    .appendTo($wordsContainer);
            });
            
            // Make the words sortable
            $wordsContainer.sortable({
                axis: 'x',
                containment: 'parent',
                cursor: 'move',
                tolerance: 'pointer',
                items: '.h5p-word-order-word',
                update: function() {
                    // Optionally, you can auto-check on every change
                }
            });
            
            // Add check button
            H5P.jQuery('<button>')
                .addClass('h5p-word-order-check-button')
                .text('Check Answer')
                .appendTo($container)
                .click(function() {
                    self.checkAnswer($wordsContainer);
                });
            
            // Add feedback container
            this.$feedback = H5P.jQuery('<div>')
                .addClass('h5p-word-order-feedback')
                .appendTo($container);
        };
        
        WordOrder.prototype.checkAnswer = function($wordsContainer) {
            var currentOrder = [];
            $wordsContainer.find('.h5p-word-order-word').each(function() {
                var $word = H5P.jQuery(this);
                var text = $word.text();
                currentOrder.push(text);
            });
            
            // Get the correct order as text
            var correctOrder = this.words.map(function(word) {
                return word.word || word;
            });
            
            var isCorrect = currentOrder.length === correctOrder.length && currentOrder.every(function(word, idx) {
                return word === correctOrder[idx];
            });
            
            this.$feedback
                .removeClass('correct incorrect')
                .addClass(isCorrect ? 'correct' : 'incorrect')
                .text(isCorrect ? this.feedback.correct : this.feedback.incorrect);
            
            // Trigger H5P completion
            if (isCorrect) {
                if (typeof this.trigger === 'function') {
                    this.trigger('resize');
                    this.trigger('xAPICompleted');
                }
            }
        };
        
        return WordOrder;
    })(H5P.jQuery);
})(H5P.jQuery); 