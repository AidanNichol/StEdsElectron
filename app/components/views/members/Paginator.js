import React from 'react';
var Paginator = React.createClass({
    propTypes: {
        max: React.PropTypes.number.isRequired,
        maxVisible: React.PropTypes.number,
        clues: React.PropTypes.array,
        changePage: React.PropTypes.func.isRequired
    },

    render: function() {
        var {currentPage, max, maxVisible, changePage, clues} = this.props;
        var className = this.props.className || '',
            halfVisible = Math.ceil(maxVisible/2),
            skip = Math.min(Math.max(0, currentPage - halfVisible), max-maxVisible);


        var iterator = Array.apply(null, Array(maxVisible)).map(function(v, i) {
            return skip + i + 1;
        });

        return (
            <nav>
                <ul className={'pagination ' + className}>
                    <li className={currentPage === 1 ? 'disabled' : ''} onClick={()=>changePage(Math.max(1, currentPage-1))}>
                            <span>&laquo;</span>
                    </li>
                    {iterator.map(function(page) {
                        return (
                            <li key={page}
                                onClick={()=>changePage(page)}
                                className={currentPage === page ? 'active' : ''}>
                                <span>{page}<br />
                                <span className="clue">{this.props.clues[page-1]}</span></span>
                            </li>
                        );
                    }, this)}
                    <li className={currentPage === max ? 'disabled' : ''} onClick={()=>changePage(Math.min(max, currentPage+1))}>
                            <span>&raquo;</span>
                    </li>
                </ul>
            </nav>
        );
    }
});
export default Paginator;
