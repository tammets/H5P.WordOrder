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
            
            // Create drop zones container
            var $dropZonesContainer = H5P.jQuery('<div>')
                .addClass('h5p-word-order-drop-zones')
                .appendTo($container);
            
            // Create words container
            var $wordsContainer = H5P.jQuery('<div>')
                .addClass('h5p-word-order-words-container')
                .appendTo($container);
            
            // Create drop zones
            this.words.forEach(function(word, index) {
                H5P.jQuery('<div>')
                    .addClass('h5p-word-order-drop-zone')
                    .attr('data-position', index)
                    .appendTo($dropZonesContainer)
                    .droppable({
                        accept: '.h5p-word-order-word',
                        hoverClass: 'h5p-word-order-drop-zone-hover',
                        drop: function(event, ui) {
                            var $word = H5P.jQuery(ui.draggable);
                            var $dropZone = H5P.jQuery(this);
                            
                            // If drop zone already has a word, move it back to words container
                            if ($dropZone.children().length > 0) {
                                $dropZone.children().appendTo($wordsContainer);
                            }
                            
                            // Move the word to the drop zone
                            $word.appendTo($dropZone);
                            
                            // Check if all words are placed
                            self.checkCompletion();
                        }
                    });
            });
            
            // Shuffle words
            var shuffledWords = [].concat(this.words).sort(function() { return Math.random() - 0.5; });
            
            // Create word elements
            shuffledWords.forEach(function(word, index) {
                H5P.jQuery('<div>')
                    .addClass('h5p-word-order-word')
                    .attr('data-index', index)
                    .text(word.word || word) // Support both object and string formats
                    .appendTo($wordsContainer)
                    .draggable({
                        revert: 'invalid',
                        helper: 'clone',
                        start: function(event, ui) {
                            H5P.jQuery(this).addClass('dragging');
                        },
                        stop: function(event, ui) {
                            H5P.jQuery(this).removeClass('dragging');
                        }
                    });
            });
            
            // Add check button
            H5P.jQuery('<button>')
                .addClass('h5p-word-order-check-button')
                .text('Check Answer')
                .appendTo($container)
                .click(function() {
                    self.checkAnswer();
                });
            
            // Add feedback container
            this.$feedback = H5P.jQuery('<div>')
                .addClass('h5p-word-order-feedback')
                .appendTo($container);
        };
        
        WordOrder.prototype.checkCompletion = function() {
            var $dropZones = H5P.jQuery('.h5p-word-order-drop-zone');
            var allWordsPlaced = $dropZones.toArray().every(function(zone) { return H5P.jQuery(zone).children().length > 0; });
            
            if (allWordsPlaced) {
                this.checkAnswer();
            }
        };
        
        WordOrder.prototype.checkAnswer = function() {
            var currentOrder = [];
            H5P.jQuery('.h5p-word-order-drop-zone').each(function() {
                var $word = H5P.jQuery(this).children('.h5p-word-order-word');
                if ($word.length > 0) {
                    currentOrder.push(parseInt($word.attr('data-index')));
                }
            });
            
            var isCorrect = currentOrder.every(function(wordIndex, position) {
                return wordIndex === position;
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